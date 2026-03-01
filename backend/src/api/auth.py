"""
Authentication API endpoints for user registration and login.

Provides endpoints for user registration, login, and JWT token generation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional
import re
import logging

from src.db.connection import get_session
from src.models.user import User
from src.utils.password import hash_password, verify_password
from src.utils.jwt_utils import create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Schemas
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


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# Endpoints
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, session: AsyncSession = Depends(get_session)):
    """
    Register a new user account.

    Creates a new user with hashed password. Validates that email and username
    are unique before creating the account. Returns JWT token for immediate authentication.

    Args:
        user_data: User registration data (email, username, password)
        session: Database session

    Returns:
        JWT token and created user data (without password_hash)

    Raises:
        HTTPException 400: If email or username already exists
        HTTPException 422: If validation fails
    """
    # Check if email already exists
    result = await session.exec(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.first()

    if existing_user:
        logger.warning(f"Registration failed: Email already exists - {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    result = await session.exec(
        select(User).where(User.username == user_data.username)
    )
    existing_username = result.first()

    if existing_username:
        logger.warning(f"Registration failed: Username already taken - {user_data.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Hash password
    password_hash = hash_password(user_data.password)

    # Create new user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    logger.info(f"User registered successfully: {new_user.email} (ID: {new_user.id})")

    # Generate JWT token for immediate authentication
    access_token = create_access_token(new_user.id)

    # Return token and user data (same as login)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(new_user)
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, session: AsyncSession = Depends(get_session)):
    """
    Authenticate user and return JWT token.

    Validates user credentials and returns a JWT token for authenticated requests.

    Args:
        credentials: User login credentials (email, password)
        session: Database session

    Returns:
        JWT token and user data

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find user by email
    result = await session.exec(
        select(User).where(User.email == credentials.email)
    )
    user = result.first()

    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Login failed: Invalid credentials for email - {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    access_token = create_access_token(user.id)

    logger.info(f"User logged in successfully: {user.email} (ID: {user.id})")

    # Return token and user data
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user)
    )
