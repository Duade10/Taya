from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    slack_team_id = Column(String, unique=True, index=True, nullable=False)
    slack_team_name = Column(String, nullable=False)
    bot_token = Column(String, nullable=False)
    bot_user_id = Column(String, nullable=False)
    access_key_used = Column(String, nullable=False)
    installed_at = Column(DateTime, default=datetime.utcnow)
    settings = Column(String, default="{}")  # JSON string for simplicity
