"""Authentication router for user registration and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, Token, UserRead
from app.utils.password import hash_password, verify_password
from app.utils.jwt_utils import create_access_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
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
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    if existing_user:
        logger.warning(f"Registration failed: Email already exists - {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = session.exec(
        select(User).where(User.username == user_data.username)
    ).first()
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
    session.commit()
    session.refresh(new_user)

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
def login(credentials: UserLogin, session: Session = Depends(get_session)):
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
    user = session.exec(
        select(User).where(User.email == credentials.email)
    ).first()

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
