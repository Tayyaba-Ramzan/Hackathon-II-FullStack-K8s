"""
FastAPI Application Entry Point

Main application configuration for Todo AI Chatbot backend.
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

from src.api.chat import router as chat_router
from src.api.conversations import router as conversations_router
from src.api.auth import router as auth_router
from src.api.tasks import router as tasks_router
from src.api.rate_limiter import RateLimiter
from src.services.logger import setup_logging
from src.db.connection import init_db, close_db

load_dotenv()

# Setup logging
setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_file=os.getenv("LOG_FILE")
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting Todo AI Chatbot backend...")
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down Todo AI Chatbot backend...")
    await close_db()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Todo AI Chatbot API",
    description="""
    AI-powered conversational task management API.

    ## Features

    * **Natural Language Processing**: Manage tasks through conversational AI
    * **Conversation History**: Maintain context across sessions
    * **MCP Tools Integration**: AI agent can perform task operations
    * **User Isolation**: Secure multi-user support with JWT authentication

    ## Authentication

    All endpoints require JWT authentication via Bearer token in the Authorization header.

    ## Rate Limiting

    API requests are rate-limited to 60 requests per minute per user.
    """,
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Todo AI Chatbot Support",
        "email": "support@example.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    }
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
# Strip whitespace from each origin
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS]
logger.info(f"CORS ALLOWED_ORIGINS: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# Rate Limiting Middleware
rate_limiter = RateLimiter(requests=60, window=60)
app.middleware("http")(rate_limiter)

# Include routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(tasks_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with consistent format.

    Args:
        request: FastAPI request object
        exc: Validation error exception

    Returns:
        JSON response with error details
    """
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Request validation failed",
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unexpected errors.

    Args:
        request: FastAPI request object
        exc: Exception that occurred

    Returns:
        JSON response with error message
    """
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    print(f"GLOBAL EXCEPTION HANDLER: {type(exc).__name__}: {str(exc)}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": f"An unexpected error occurred: {str(exc)}"
        }
    )


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint providing API information.

    Returns:
        API metadata and links
    """
    return {
        "name": "Todo AI Chatbot API",
        "version": "3.0.0",
        "description": "AI-powered conversational task management",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.

    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "todo-ai-chatbot",
        "version": "3.0.0"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
