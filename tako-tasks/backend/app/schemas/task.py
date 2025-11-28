from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.models.task import TaskStatus


class TaskBase(BaseModel):
    title: str
    description: str
    assignee_user_id: str
    priority: str
    status: TaskStatus = TaskStatus.pending
    due_date: Optional[datetime] = None
    tags: str = ""


class TaskCreate(TaskBase):
    creator_user_id: str
    workspace_id: int


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    assignee_user_id: Optional[str]
    priority: Optional[str]
    status: Optional[TaskStatus]
    due_date: Optional[datetime]
    tags: Optional[str]


class TaskOut(TaskBase):
    id: int
    creator_user_id: str
    workspace_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class TaskHistoryOut(BaseModel):
    id: int
    task_id: int
    user_id: str
    action: str
    metadata: dict
    created_at: datetime

    class Config:
        orm_mode = True


class TaskDetail(TaskOut):
    history: List[TaskHistoryOut] = []
