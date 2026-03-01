"""
Database connection module for Todo AI Chatbot.

Provides async SQLModel connection to Neon PostgreSQL with connection pooling.
"""
from typing import AsyncGenerator
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Convert postgresql:// to postgresql+asyncpg:// for async support
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove sslmode and channel_binding from URL (asyncpg handles SSL differently)
# asyncpg will use SSL by default for remote connections
if "sslmode=" in DATABASE_URL:
    # Split URL and query string
    base_url, query_string = DATABASE_URL.split("?", 1) if "?" in DATABASE_URL else (DATABASE_URL, "")
    # Remove sslmode and channel_binding parameters
    query_params = [p for p in query_string.split("&") if not p.startswith("sslmode=") and not p.startswith("channel_binding=")]
    DATABASE_URL = base_url + ("?" + "&".join(query_params) if query_params else "")

# Connection pool configuration
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # 1 hour
ECHO_SQL = os.getenv("DB_ECHO_SQL", "false").lower() == "true"

# Create async engine with optimized connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=ECHO_SQL,  # Set to False in production for performance
    future=True,
    pool_size=POOL_SIZE,  # Number of connections to maintain
    max_overflow=MAX_OVERFLOW,  # Additional connections when pool is full
    pool_timeout=POOL_TIMEOUT,  # Seconds to wait for connection
    pool_recycle=POOL_RECYCLE,  # Recycle connections after this many seconds
    pool_pre_ping=True,  # Verify connections before using (prevents stale connections)
    connect_args={"ssl": "require"},  # SSL configuration for asyncpg
    # Use NullPool for serverless environments (uncomment if needed)
    # poolclass=NullPool,
)

# Create async session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

logger.info(f"Database engine configured with pool_size={POOL_SIZE}, max_overflow={MAX_OVERFLOW}")


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session.

    Usage in FastAPI:
        @app.get("/items")
        async def get_items(session: AsyncSession = Depends(get_session)):
            ...
    """
    async with async_session_maker() as session:
        yield session


async def close_db():
    """Close database connections."""
    await engine.dispose()
