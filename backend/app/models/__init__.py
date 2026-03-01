"""Models package - imports all models for SQLModel metadata registration."""

from app.models.user import User
from app.models.task import Task

__all__ = ["User", "Task"]
