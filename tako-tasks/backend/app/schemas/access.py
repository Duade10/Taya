from datetime import datetime
from pydantic import BaseModel, EmailStr, constr


class AccessRequest(BaseModel):
    name: str
    email: EmailStr
    company: str
    team_size: constr(strip_whitespace=True, min_length=1)


class AccessVerify(BaseModel):
    key: constr(strip_whitespace=True, min_length=6)


class AccessKeyOut(BaseModel):
    slack_install_url: str

    class Config:
        orm_mode = True


class AccessKeyRecord(BaseModel):
    id: int
    name: str
    email: EmailStr
    company: str
    team_size: str
    is_used: bool
    issued_at: datetime
    used_at: datetime | None

    class Config:
        orm_mode = True
