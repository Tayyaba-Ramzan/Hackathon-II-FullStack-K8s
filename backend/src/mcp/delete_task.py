"""
MCP Tool: delete_task

Permanently deletes a task for the authenticated user.
"""
from typing import Dict, Any
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class DeleteTaskParams(BaseModel):
    """Parameters for delete_task tool."""
    user_id: str  # Changed from int to str
    task_id: int


async def delete_task(
    params: Dict[str, Any],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    Permanently delete a task.

    Args:
        params: Dictionary with user_id and task_id
        session: Async database session

    Returns:
        Dictionary with success status, task_id, and message
    """
    try:
        # Validate parameters
        validated_params = DeleteTaskParams(**params)

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

        task_title = task.title

        # Delete task
        await session.delete(task)
        await session.commit()

        logger.info(f"Task deleted: {validated_params.task_id} for user {validated_params.user_id}")

        return {
            "success": True,
            "task_id": str(validated_params.task_id),
            "message": f"Task '{task_title}' deleted successfully"
        }

    except ValueError as e:
        logger.warning(f"Validation error in delete_task: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Error in delete_task: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to delete task: {str(e)}"
        }
