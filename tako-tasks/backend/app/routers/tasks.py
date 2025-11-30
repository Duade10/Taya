import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskDetail
from app.models import Task, TaskHistory, TaskStatus, Workspace
from app.services.auth import decode_jwt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_workspace(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Workspace:
    payload = decode_jwt(token)
    workspace_id = payload.get("workspace_id")
    workspace = db.query(Workspace).get(workspace_id)
    if not workspace:
        raise HTTPException(status_code=401, detail="Workspace not found")
    return workspace


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    assignee: str | None = None,
    status: TaskStatus | None = None,
    priority: str | None = None,
    due_date: datetime | None = None,
    tag: str | None = Query(default=None, description="Filter tasks containing tag"),
    search: str | None = None,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
):
    query = db.query(Task).filter(Task.workspace_id == workspace.id)
    if assignee:
        query = query.filter(Task.assignee_user_id == assignee)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if due_date:
        query = query.filter(Task.due_date <= due_date)
    if tag:
        query = query.filter(Task.tags.ilike(f"%{tag}%"))
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    return query.order_by(Task.created_at.desc()).all()


@router.get("/tasks/{task_id}", response_model=TaskDetail)
def get_task(task_id: int, db: Session = Depends(get_db), workspace: Workspace = Depends(get_current_workspace)):
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.workspace_id == workspace.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/tasks", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), workspace: Workspace = Depends(get_current_workspace)):
    if payload.workspace_id != workspace.id:
        raise HTTPException(status_code=403, detail="Invalid workspace")
    task = Task(**payload.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    history = TaskHistory(
        task_id=task.id,
        user_id=payload.creator_user_id,
        action="created",
        details={"title": task.title},
    )
    db.add(history)
    db.commit()
    return task


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
):
    task = db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.add(task)
    db.add(
        TaskHistory(
            task_id=task.id,
            user_id=workspace.bot_user_id,
            action="updated",
            details=payload.dict(exclude_unset=True),
        )
    )
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), workspace: Workspace = Depends(get_current_workspace)):
    task = db.query(Task).filter(Task.id == task_id, Task.workspace_id == workspace.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}


@router.get("/workspace/settings")
def get_workspace_settings(workspace: Workspace = Depends(get_current_workspace)):
    return json.loads(workspace.settings or "{}")


@router.put("/workspace/settings")
def update_workspace_settings(
    payload: dict, db: Session = Depends(get_db), workspace: Workspace = Depends(get_current_workspace)
):
    workspace.settings = json.dumps(payload)
    db.add(workspace)
    db.commit()
    return payload
