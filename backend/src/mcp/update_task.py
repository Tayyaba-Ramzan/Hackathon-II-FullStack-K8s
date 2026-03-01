"""
MCP Tool: update_task

Updates task title and/or description for the authenticated user.
"""
from typing import Optional, Dict, Any
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, Field, validator
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class UpdateTaskParams(BaseModel):
    """Parameters for update_task tool."""
    user_id: str  # Changed from int to str
    task_id: int
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)

    @validator('title')
    def title_not_empty_if_provided(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError("Title cannot be empty")
        return v.strip() if v else None

    @validator('description', always=True)
    def at_least_one_field(cls, v, values):
        if values.get('title') is None and v is None:
            raise ValueError("At least one of title or description must be provided")
        return v


async def update_task(
    params: Dict[str, Any],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Update task title and/or description.

    Args:
        params: Dictionary with user_id, task_id, and optional title/description
        session: Async database session

    Returns:
        Dictionary with success status, task_id, and message
    """
    try:
        # Validate parameters
        validated_params = UpdateTaskParams(**params)

        # Import Task model
        from app.models.task import Task

        # Find task with user_id isolation
        query = select(Task).where(
            Task.id == validated_params.task_id,
            Task.user_id == int(validated_params.user_id)
        )
        result = await session.execute(query)
        task = result.scalar_one_or_none()

        if not task:
            return {
                "success": False,
                "error": "Task not found or does not belong to user"
            }

        # Update fields if provided
        if validated_params.title is not None:
            task.title = validated_params.title

        if validated_params.description is not None:
            task.description = validated_params.description

        task.updated_at = datetime.utcnow()

        session.add(task)
        await session.commit()
        await session.refresh(task)

        logger.info(f"Task updated: {task.id} for user {validated_params.user_id}")

        return {
            "success": True,
            "task_id": str(task.id),
            "message": f"Task '{task.title}' updated successfully"
        }

    except ValueError as e:
        logger.warning(f"Validation error in update_task: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Error in update_task: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to update task: {str(e)}"
        }
