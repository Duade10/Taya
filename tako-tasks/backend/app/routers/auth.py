import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workspace import Workspace
from app.schemas.auth import MagicLinkRequest, TokenResponse, SlackLogin
from app.services.auth import create_jwt
from app.email.sender import send_access_key_email

router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter_by(slack_team_id=form_data.username).first()
    if not workspace:
        raise HTTPException(status_code=401, detail="Workspace not installed")
    token = create_jwt({"workspace_id": workspace.id, "slack_team_id": workspace.slack_team_id})
    return TokenResponse(access_token=token)


@router.post("/auth/slack", response_model=TokenResponse)
def slack_login(payload: SlackLogin, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter_by(id=payload.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    token = create_jwt({"workspace_id": workspace.id, "slack_user_id": payload.slack_user_id})
    return TokenResponse(access_token=token)


@router.post("/auth/magic-link")
def magic_link(payload: MagicLinkRequest, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter_by(id=payload.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    token = create_jwt({"workspace_id": workspace.id, "email": payload.email})
    send_access_key_email(payload.email, payload.email.split("@")[0], key=f"Magic login token: {token}")
    return {"message": "Magic link sent"}
