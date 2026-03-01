from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional
import re


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr = Field(..., max_length=255, description="User's email address")
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r'^[a-zA-Z0-9_]+$',
        description="User's username (alphanumeric and underscores only)"
    )


class UserRegister(BaseModel):
    """Schema for user registration with password."""

    email: EmailStr = Field(..., max_length=255, description="User's email address")
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="User's username (alphanumeric and underscores only)"
    )
    password: str = Field(..., min_length=8, description="User's password")

    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must be alphanumeric with underscores only')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class Token(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: "UserRead"


class UserRead(BaseModel):
    """Schema for reading user data."""

    id: int
    email: str
    username: str
    created_at: datetime
    dark_mode: bool = False
    email_notifications: bool = True
    task_reminders: bool = True

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    email: Optional[EmailStr] = Field(None, max_length=255, description="User's email address")
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        description="User's username (alphanumeric and underscores only)"
    )

    @validator('username')
    def validate_username(cls, v):
        if v is not None and not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username must be alphanumeric with underscores only')
        return v


class UserPreferences(BaseModel):
    """Schema for updating user preferences."""

    dark_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None
    task_reminders: Optional[bool] = None
