"""
Authentication Middleware

Validates JWT tokens and enforces authentication for protected routes.
"""
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """
    Verify JWT token and extract payload.

    Args:
        credentials: HTTP authorization credentials with bearer token

    Returns:
        Token payload dictionary

    Raises:
        HTTPException: If token is invalid or expired
    """
    from src.utils.jwt_utils import verify_token as jwt_verify

    token = credentials.credentials

    try:
        user_id = jwt_verify(token)
        return {"user_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to get current authenticated user from JWT token.

    Usage in FastAPI routes:
        @app.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            user_id = user["user_id"]
            ...

    Args:
        credentials: HTTP authorization credentials

    Returns:
        User information from token payload

    Raises:
        HTTPException: If authentication fails
    """
    payload = await verify_token(credentials)

    if "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    return payload


class AuthMiddleware:
    """
    Middleware to enforce authentication on all routes except public ones.
    """

    def __init__(self, public_paths: list = None):
        """
        Initialize auth middleware.

        Args:
            public_paths: List of path prefixes that don't require authentication
        """
        self.public_paths = public_paths or ["/docs", "/openapi.json", "/health"]

    async def __call__(self, request: Request, call_next):
        """
        Process request and enforce authentication.

        Args:
            request: FastAPI request
            call_next: Next middleware/route handler

        Returns:
            Response from next handler

        Raises:
            HTTPException: If authentication required but not provided
        """
        # Check if path is public
        for public_path in self.public_paths:
            if request.url.path.startswith(public_path):
                return await call_next(request)

        # Check for authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Continue to next handler
        return await call_next(request)
