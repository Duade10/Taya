from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.access import AccessRequest, AccessVerify, AccessKeyOut
from app.services import access as access_service
from app.slack.service import build_install_url, exchange_code
from app.models.workspace import Workspace

router = APIRouter()


@router.post("/request-access")
def request_access(payload: AccessRequest, db: Session = Depends(get_db)):
    record = access_service.create_and_send_access_key(
        db, payload.name, payload.email, payload.company, payload.team_size
    )
    return {"message": "Access key issued", "id": record.id}


@router.post("/verify-key", response_model=AccessKeyOut)
def verify_key(payload: AccessVerify, db: Session = Depends(get_db)):
    record = access_service.verify_key(db, payload.key)
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or used key")
    return {"slack_install_url": f"{build_install_url()}&state={payload.key}"}


@router.get("/slack/install")
def slack_install():
    return RedirectResponse(build_install_url())


@router.get("/slack/oauth/callback")
def slack_oauth_callback(code: str, state: str | None = None, db: Session = Depends(get_db)):
    data = exchange_code(code)
    bot_token = data.get("access_token") or data.get("bot", {}).get("bot_access_token")
    bot_user_id = data.get("bot_user_id") or data.get("bot", {}).get("bot_user_id")
    team = data.get("team", {})
    if not bot_token or not bot_user_id:
        raise HTTPException(status_code=400, detail="Bot token missing in response")

    existing = db.query(Workspace).filter_by(slack_team_id=team.get("id")).first()
    if existing:
        existing.bot_token = bot_token
        existing.bot_user_id = bot_user_id
        existing.slack_team_name = team.get("name", existing.slack_team_name)
        existing.access_key_used = state or existing.access_key_used
        db.add(existing)
        workspace = existing
    else:
        workspace = Workspace(
            slack_team_id=team.get("id"),
            slack_team_name=team.get("name", ""),
            bot_token=bot_token,
            bot_user_id=bot_user_id,
            access_key_used=state or "",
        )
        db.add(workspace)
    db.commit()
    return {"ok": True, "team": team}
