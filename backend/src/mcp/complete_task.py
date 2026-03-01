"""
MCP Tool: complete_task

Marks a task as completed for the authenticated user.
"""
from typing import Dict, Any
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class CompleteTaskParams(BaseModel):
    """Parameters for complete_task tool."""
    user_id: str  # Changed from int to str
    task_id: int


async def complete_task(
    params: Dict[str, Any],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        params: Dictionary with user_id and task_id
        session: Async database session

    Returns:
        Dictionary with success status, task_id, and message
    """
    try:
        # Validate parameters
        validated_params = CompleteTaskParams(**params)

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

        # Check if already completed
        if task.is_completed:
            return {
                "success": False,
                "error": "Task is already completed"
            }

        # Mark as completed
        task.is_completed = True
        task.updated_at = datetime.utcnow()

        session.add(task)
        await session.commit()
        await session.refresh(task)

        logger.info(f"Task completed: {task.id} for user {validated_params.user_id}")

        return {
            "success": True,
            "task_id": str(task.id),
            "message": f"Task '{task.title}' marked as completed"
        }

    except ValueError as e:
        logger.warning(f"Validation error in complete_task: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Error in complete_task: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to complete task: {str(e)}"
        }
