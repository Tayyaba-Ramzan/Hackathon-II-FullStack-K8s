from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserPreferences
from app.middleware.jwt_auth import get_current_user
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    """Create a new user account (deprecated - use /auth/register instead)."""
    db_user = User(email=user.email, username=user.username)

    try:
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    except IntegrityError as e:
        session.rollback()
        if "email" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        elif "username" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User creation failed"
            )


@router.get("/", response_model=list[UserRead])
def get_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all users (requires authentication)."""
    users = session.exec(select(User)).all()
    return users


@router.get("/me/profile", response_model=UserRead)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return current_user


@router.put("/me/profile", response_model=UserRead)
def update_current_user_profile(
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile (email, username)."""
    try:
        # Update email if provided
        if user_update.email is not None:
            # Check if email already exists (excluding current user)
            existing_email = session.exec(
                select(User).where(User.email == user_update.email, User.id != current_user.id)
            ).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
            current_user.email = user_update.email

        # Update username if provided
        if user_update.username is not None:
            # Check if username already exists (excluding current user)
            existing_username = session.exec(
                select(User).where(User.username == user_update.username, User.id != current_user.id)
            ).first()
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
            current_user.username = user_update.username

        session.add(current_user)
        session.commit()
        session.refresh(current_user)

        logger.info(f"User profile updated: {current_user.email} (ID: {current_user.id})")
        return current_user

    except IntegrityError as e:
        session.rollback()
        logger.error(f"Profile update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile update failed due to constraint violation"
        )


@router.put("/me/preferences", response_model=UserRead)
def update_user_preferences(
    preferences: UserPreferences,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update current user's preferences (dark mode, notifications, reminders)."""
    # Update preferences if provided
    if preferences.dark_mode is not None:
        current_user.dark_mode = preferences.dark_mode

    if preferences.email_notifications is not None:
        current_user.email_notifications = preferences.email_notifications

    if preferences.task_reminders is not None:
        current_user.task_reminders = preferences.task_reminders

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    logger.info(f"User preferences updated: {current_user.email} (ID: {current_user.id})")
    return current_user


@router.delete("/me/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user_account(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete current user's account and all associated data."""
    user_id = current_user.id
    user_email = current_user.email

    # Delete user (cascade will delete associated tasks)
    session.delete(current_user)
    session.commit()

    logger.warning(f"User account deleted: {user_email} (ID: {user_id})")
    return None


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific user by ID (requires authentication)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
