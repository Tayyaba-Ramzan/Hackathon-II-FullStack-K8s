"""
Rate Limiting Middleware

Implements rate limiting to prevent API abuse and ensure fair usage.
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

# In-memory rate limit storage (use Redis in production)
rate_limit_storage: Dict[str, Tuple[int, datetime]] = defaultdict(lambda: (0, datetime.now()))

# Rate limit configuration
RATE_LIMIT_REQUESTS = 60  # requests per window
RATE_LIMIT_WINDOW = 60  # seconds


class RateLimiter:
    """Rate limiter middleware for FastAPI."""

    def __init__(self, requests: int = RATE_LIMIT_REQUESTS, window: int = RATE_LIMIT_WINDOW):
        """
        Initialize rate limiter.

        Args:
            requests: Maximum number of requests allowed per window
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window

    async def __call__(self, request: Request, call_next):
        """
        Process request with rate limiting.

        Args:
            request: FastAPI request object
            call_next: Next middleware in chain

        Returns:
            Response or rate limit error
        """
        # Get client identifier (IP address or user_id from auth)
        client_id = self._get_client_id(request)

        # Check rate limit
        if not self._check_rate_limit(client_id):
            logger.warning(f"Rate limit exceeded for client: {client_id}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate Limit Exceeded",
                    "message": f"Too many requests. Please try again in {self.window} seconds.",
                    "timestamp": datetime.now().isoformat()
                }
            )

        # Process request
        response = await call_next(request)
        return response

    def _get_client_id(self, request: Request) -> str:
        """
        Get client identifier from request.

        Args:
            request: FastAPI request object

        Returns:
            Client identifier (IP or user_id)
        """
        # Try to get user_id from path params (for authenticated endpoints)
        if "user_id" in request.path_params:
            return f"user:{request.path_params['user_id']}"

        # Fallback to IP address
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"

    def _check_rate_limit(self, client_id: str) -> bool:
        """
        Check if client has exceeded rate limit.

        Args:
            client_id: Client identifier

        Returns:
            True if within rate limit, False if exceeded
        """
        now = datetime.now()
        count, window_start = rate_limit_storage[client_id]

        # Check if window has expired
        if now - window_start > timedelta(seconds=self.window):
            # Reset window
            rate_limit_storage[client_id] = (1, now)
            return True

        # Check if limit exceeded
        if count >= self.requests:
            return False

        # Increment counter
        rate_limit_storage[client_id] = (count + 1, window_start)
        return True


def cleanup_rate_limit_storage():
    """
    Clean up expired entries from rate limit storage.
    Should be called periodically (e.g., via background task).
    """
    now = datetime.now()
    expired_keys = [
        key for key, (_, window_start) in rate_limit_storage.items()
        if now - window_start > timedelta(seconds=RATE_LIMIT_WINDOW * 2)
    ]

    for key in expired_keys:
        del rate_limit_storage[key]

    if expired_keys:
        logger.info(f"Cleaned up {len(expired_keys)} expired rate limit entries")
