from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

class UserRegister(BaseModel):
    fullName: str
    organization: str
    email: EmailStr
    password: str
    role: Optional[str] = "Security Analyst"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization: str
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
