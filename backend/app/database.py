from sqlmodel import SQLModel, create_engine, Session
from app.config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.database_url,
    echo=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)


def create_db_and_tables():
    """Create all database tables."""
    # Import models to register them with SQLModel metadata
    from app.models import User, Task  # noqa: F401

    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def get_session():
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session
