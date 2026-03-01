"""
User ID Extraction Utilities

Helper functions for extracting and validating user_id from requests.
"""
from fastapi import HTTPException, status
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def extract_user_id_from_token(token_payload: dict) -> int:
    """
    Extract user_id from JWT token payload.

    Args:
        token_payload: Decoded JWT token payload

    Returns:
        User ID as integer

    Raises:
        HTTPException: If user_id is missing or invalid
    """
    user_id = token_payload.get("user_id")

    if user_id is None:
        logger.error("user_id missing from token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: user_id missing"
        )

    try:
        return int(user_id)
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid user_id format in token: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: user_id format error"
        )


def validate_user_id_match(token_user_id: int, path_user_id: int) -> None:
    """
    Validate that user_id from token matches user_id in request path.

    This prevents users from accessing other users' resources by
    manipulating the path parameter.

    Args:
        token_user_id: User ID from JWT token
        path_user_id: User ID from request path

    Raises:
        HTTPException: If user IDs don't match
    """
    if token_user_id != path_user_id:
        logger.warning(
            f"User ID mismatch: token={token_user_id}, path={path_user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )


def parse_user_id_from_path(user_id_str: str) -> int:
    """
    Parse and validate user_id from path parameter.

    Args:
        user_id_str: User ID string from path

    Returns:
        User ID as integer

    Raises:
        HTTPException: If user_id format is invalid
    """
    try:
        return int(user_id_str)
    except (ValueError, TypeError) as e:
        logger.warning(f"Invalid user_id in path: {user_id_str}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format"
        )


async def get_authenticated_user_id(
    token_payload: dict,
    path_user_id: Optional[str] = None
) -> int:
    """
    Get authenticated user_id with optional path validation.

    This is the main utility function to use in route handlers.

    Args:
        token_payload: Decoded JWT token payload
        path_user_id: Optional user_id from path to validate against

    Returns:
        Validated user ID as integer

    Raises:
        HTTPException: If validation fails

    Example:
        @app.get("/api/{user_id}/tasks")
        async def get_tasks(
            user_id: str,
            current_user: dict = Depends(get_current_user)
        ):
            validated_user_id = await get_authenticated_user_id(
                current_user, user_id
            )
            # Now safe to use validated_user_id
    """
    # Extract user_id from token
    token_user_id = extract_user_id_from_token(token_payload)

    # If path user_id provided, validate it matches token
    if path_user_id:
        path_int = parse_user_id_from_path(path_user_id)
        validate_user_id_match(token_user_id, path_int)

    return token_user_id
