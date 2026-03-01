"""
Tasks API Endpoint

Provides REST API for task management operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
import logging

from src.db.connection import get_session
from src.auth.middleware import get_current_user
from src.auth.utils import get_authenticated_user_id
from app.models.task import Task

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    """Request model for creating a task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)


class TaskUpdate(BaseModel):
    """Request model for updating a task."""
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    is_completed: bool | None = None


class TaskRead(BaseModel):
    """Response model for task data."""
    id: int
    title: str
    description: str | None
    is_completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create a new task for the authenticated user."""
    user_id = current_user.get("user_id")

    db_task = Task(
        title=task.title,
        description=task.description,
        user_id=user_id,
        is_completed=False
    )

    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)

    logger.info(f"Task {db_task.id} created for user {user_id}")
    return db_task


@router.get("/", response_model=List[TaskRead])
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all tasks for the authenticated user."""
    user_id = current_user.get("user_id")

    query = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    result = await session.execute(query)
    tasks = result.scalars().all()

    logger.info(f"Retrieved {len(tasks)} tasks for user {user_id}")
    return tasks


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve a specific task by its ID."""
    user_id = current_user.get("user_id")

    query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing task."""
    user_id = current_user.get("user_id")

    query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update only provided fields
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.is_completed is not None:
        task.is_completed = task_update.is_completed

    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    logger.info(f"Task {task_id} updated for user {user_id}")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Delete a task."""
    user_id = current_user.get("user_id")

    query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    await session.delete(task)
    await session.commit()

    logger.info(f"Task {task_id} deleted for user {user_id}")
    return None


@router.patch("/{task_id}/toggle", response_model=TaskRead)
async def toggle_task_completion(
    task_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Toggle the completion status of a task."""
    user_id = current_user.get("user_id")

    query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    logger.info(f"Task {task_id} toggled to {task.is_completed} for user {user_id}")
    return task
