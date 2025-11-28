import json
import os
from datetime import datetime
import requests
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Task, TaskHistory, Workspace, TaskStatus
from app.slack.service import verify_slack_request, task_modal, task_message_blocks

router = APIRouter()

SLACK_API_BASE = "https://slack.com/api"


def get_workspace_by_team(db: Session, team_id: str) -> Workspace:
    workspace = db.query(Workspace).filter_by(slack_team_id=team_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not installed")
    return workspace


@router.post("/slack/commands")
async def slack_commands(
    request: Request,
    db: Session = Depends(get_db),
    x_slack_signature: str = Header(""),
    x_slack_request_timestamp: str = Header(""),
):
    body = await request.body()
    if not verify_slack_request(x_slack_request_timestamp, x_slack_signature, body.decode()):
        raise HTTPException(status_code=401, detail="Invalid signature")

    form = await request.form()
    command = form.get("command")
    text = (form.get("text") or "").strip()
    trigger_id = form.get("trigger_id")
    team_id = form.get("team_id")

    workspace = get_workspace_by_team(db, team_id)
    token = workspace.bot_token

    if command == "/task" and (text == "create" or text == ""):
        modal = task_modal(trigger_id)
        requests.post(
            f"{SLACK_API_BASE}/views.open",
            headers={"Authorization": f"Bearer {token}"},
            json=modal,
            timeout=10,
        )
        return {"response_type": "ephemeral", "text": "Opening task modal..."}
    return {"text": "Unsupported command"}


@router.post("/slack/interactions")
async def slack_interactions(request: Request, db: Session = Depends(get_db)):
    payload_raw = await request.form()
    payload = json.loads(payload_raw.get("payload"))
    team = payload.get("team", {}).get("id")
    workspace = get_workspace_by_team(db, team)
    token = workspace.bot_token

    if payload.get("type") == "view_submission" and payload.get("view", {}).get("callback_id") == "task_create":
        values = payload["view"]["state"]["values"]
        task = Task(
            title=values["title_block"]["title_input"]["value"],
            description=values["description_block"]["description_input"]["value"],
            assignee_user_id=values["assignee_block"]["assignee_input"]["selected_user"],
            creator_user_id=payload.get("user", {}).get("id"),
            workspace_id=workspace.id,
            priority=values["priority_block"]["priority_input"]["selected_option"]["value"],
            status=TaskStatus.pending,
            due_date=datetime.strptime(values["due_block"]["due_input"].get("selected_date"), "%Y-%m-%d") if values.get("due_block", {}).get("due_input") else None,
            tags=values.get("tags_block", {}).get("tags_input", {}).get("value", ""),
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        db.add(
            TaskHistory(
                task_id=task.id,
                user_id=task.creator_user_id,
                action="created",
                metadata={"source": "slack"},
            )
        )
        db.commit()

        requests.post(
            f"{SLACK_API_BASE}/chat.postMessage",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "channel": payload.get("user", {}).get("id"),
                "text": f"New task created: {task.title}",
                "blocks": task_message_blocks({**task.__dict__}),
            },
            timeout=10,
        )
        return {"response_action": "clear"}

    if payload.get("type") == "block_actions":
        action = payload.get("actions", [])[0]
        value = json.loads(action.get("value", "{}"))
        task_id = value.get("task_id")
        task = db.query(Task).filter_by(id=task_id, workspace_id=workspace.id).first()
        if not task:
            return {"text": "Task not found"}
        if value.get("action") == "complete":
            task.status = TaskStatus.done
        db.add(task)
        db.add(
            TaskHistory(
                task_id=task.id,
                user_id=payload.get("user", {}).get("id", ""),
                action=value.get("action", "updated"),
                metadata=value,
            )
        )
        db.commit()
        return {"text": f"Updated task {task.title}"}

    return {"text": "Unhandled interaction"}
