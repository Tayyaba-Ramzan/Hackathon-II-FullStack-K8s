"""
MCP Tool: add_task

Creates a new task for the authenticated user.
"""
from typing import Optional, Dict, Any
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, Field, validator
import logging

logger = logging.getLogger(__name__)


class AddTaskParams(BaseModel):
    """Parameters for add_task tool."""
    user_id: str  # Changed from int to str to match conversation tables
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)

    @validator('title')
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()


async def add_task(
    params: Dict[str, Any],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Add a new task for the user.

    Args:
        params: Dictionary with user_id, title, and optional description
        session: Async database session

    Returns:
        Dictionary with success status, task_id, and message
    """
    try:
        # Validate parameters
        validated_params = AddTaskParams(**params)

        # Import Task model from Phase II
        from app.models.task import Task

        # Create new task
        new_task = Task(
            user_id=int(validated_params.user_id),  # Convert string to int for Task model
            title=validated_params.title,
            description=validated_params.description,
            is_completed=False
        )

        session.add(new_task)
        await session.commit()
        await session.refresh(new_task)

        logger.info(f"Task created: {new_task.id} for user {validated_params.user_id}")

        return {
            "success": True,
            "task_id": str(new_task.id),
            "message": f"Task '{new_task.title}' created successfully"
        }

    except ValueError as e:
        logger.warning(f"Validation error in add_task: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Error in add_task: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to create task: {str(e)}"
        }
