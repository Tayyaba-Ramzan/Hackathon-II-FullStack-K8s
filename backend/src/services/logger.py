"""
Logging Infrastructure

Centralized logging configuration for the application.
"""
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


def setup_logging(
    log_level: str = "INFO",
    log_file: Optional[str] = None,
    log_format: Optional[str] = None
) -> None:
    """
    Configure application-wide logging.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for log output
        log_format: Optional custom log format
    """
    if log_format is None:
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        handlers=_get_handlers(log_file)
    )

    # Set specific log levels for noisy libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.INFO)


def _get_handlers(log_file: Optional[str] = None) -> list:
    """
    Get logging handlers.

    Args:
        log_file: Optional file path for log output

    Returns:
        List of logging handlers
    """
    handlers = []

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    )
    handlers.append(console_handler)

    # File handler (if specified)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(
            logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        )
        handlers.append(file_handler)

    return handlers


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a module.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(name)


class RequestLogger:
    """Logger for HTTP requests and responses."""

    def __init__(self, logger_name: str = "api"):
        """
        Initialize request logger.

        Args:
            logger_name: Name for the logger
        """
        self.logger = logging.getLogger(logger_name)

    def log_request(
        self,
        method: str,
        path: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        """
        Log incoming request.

        Args:
            method: HTTP method
            path: Request path
            user_id: Optional user identifier
            request_id: Optional request identifier
        """
        log_data = {
            "method": method,
            "path": path,
            "user_id": user_id,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat()
        }
        self.logger.info(f"Request: {log_data}")

    def log_response(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        """
        Log outgoing response.

        Args:
            method: HTTP method
            path: Request path
            status_code: HTTP status code
            duration_ms: Request duration in milliseconds
            user_id: Optional user identifier
            request_id: Optional request identifier
        """
        log_data = {
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
            "user_id": user_id,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat()
        }

        if status_code >= 500:
            self.logger.error(f"Response: {log_data}")
        elif status_code >= 400:
            self.logger.warning(f"Response: {log_data}")
        else:
            self.logger.info(f"Response: {log_data}")

    def log_error(
        self,
        error: Exception,
        method: str,
        path: str,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> None:
        """
        Log request error.

        Args:
            error: Exception that occurred
            method: HTTP method
            path: Request path
            user_id: Optional user identifier
            request_id: Optional request identifier
        """
        log_data = {
            "method": method,
            "path": path,
            "error": str(error),
            "error_type": type(error).__name__,
            "user_id": user_id,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat()
        }
        self.logger.error(f"Error: {log_data}", exc_info=True)


# Global request logger instance
request_logger = RequestLogger()
