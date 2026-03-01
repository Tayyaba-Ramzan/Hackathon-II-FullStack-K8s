"""
MCP Tool: list_tasks

Retrieves all tasks for the authenticated user with optional filtering.
"""
from typing import Optional, Dict, Any, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)


class ListTasksParams(BaseModel):
    """Parameters for list_tasks tool."""
    user_id: str  # Changed from int to str
    completed: Optional[bool] = None


async def list_tasks(
    params: Dict[str, Any],
    session: AsyncSession
) -> Dict[str, Any]:
    """
    List all tasks for the user with optional filtering.

    Args:
        params: Dictionary with user_id and optional completed filter
        session: Async database session

    Returns:
        Dictionary with success status, tasks array, and count
    """
    try:
        # Validate parameters
        validated_params = ListTasksParams(**params)

        # Import Task model
        from app.models.task import Task

        # Build query with user_id filter
        query = select(Task).where(Task.user_id == int(validated_params.user_id))

        # Apply completed filter if provided
        if validated_params.completed is not None:
            query = query.where(Task.is_completed == validated_params.completed)

        # Order by created_at descending
        query = query.order_by(Task.created_at.desc())

        # Execute query
        result = await session.execute(query)
        tasks = result.scalars().all()

        # Format tasks for response
        tasks_data = [
            {
                "task_id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.is_completed,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            for task in tasks
        ]

        logger.info(f"Listed {len(tasks_data)} tasks for user {validated_params.user_id}")

        return {
            "success": True,
            "tasks": tasks_data,
            "count": len(tasks_data)
        }

    except ValueError as e:
        logger.warning(f"Validation error in list_tasks: {str(e)}")
        return {
            "success": False,
            "error": f"Invalid user_id format: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Error in list_tasks: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to list tasks: {str(e)}"
        }
