from pydantic import BaseModel, EmailStr, constr


class MagicLinkRequest(BaseModel):
    email: EmailStr
    workspace_id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SlackLogin(BaseModel):
    slack_user_id: constr(strip_whitespace=True, min_length=1)
    workspace_id: int
