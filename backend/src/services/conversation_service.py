"""
Conversation Service

Manages conversations and messages for chat history persistence.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import logging
from uuid import uuid4

from src.models.conversation import Conversation
from src.models.message import Message, MessageRole

logger = logging.getLogger(__name__)


async def create_conversation(
    user_id: str,
    session: AsyncSession
) -> Conversation:
    """
    Create a new conversation for the user.

    Args:
        user_id: User identifier (UUID string)
        session: Database session

    Returns:
        Created Conversation object
    """
    conversation = Conversation(
        id=str(uuid4()),
        user_id=user_id
    )

    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)

    logger.info(f"Created conversation {conversation.id} for user {user_id}")
    return conversation


async def get_conversation(
    conversation_id: str,
    user_id: str,
    session: AsyncSession
) -> Optional[Conversation]:
    """
    Get conversation by ID with user_id validation.

    Args:
        conversation_id: Conversation identifier (UUID string)
        user_id: User identifier for validation (UUID string)
        session: Database session

    Returns:
        Conversation object or None if not found/unauthorized
    """
    query = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )
    result = await session.execute(query)
    conversation = result.scalar_one_or_none()

    if conversation:
        logger.info(f"Retrieved conversation {conversation_id}")
    else:
        logger.warning(f"Conversation {conversation_id} not found for user {user_id}")

    return conversation


async def save_message(
    conversation_id: str,
    user_id: str,
    role: MessageRole,
    content: str,
    session: AsyncSession
) -> Message:
    """
    Save a message to the conversation.

    Args:
        conversation_id: Conversation identifier (UUID string)
        user_id: User identifier (UUID string)
        role: Message role (user or assistant)
        content: Message content
        session: Database session

    Returns:
        Created Message object
    """
    message = Message(
        id=str(uuid4()),
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content
    )

    session.add(message)
    await session.commit()
    await session.refresh(message)

    # Update conversation's updated_at timestamp
    conv_query = select(Conversation).where(Conversation.id == conversation_id)
    conv_result = await session.execute(conv_query)
    conversation = conv_result.scalar_one_or_none()

    if conversation:
        conversation.updated_at = datetime.utcnow()
        await session.commit()

    logger.info(f"Saved {role.value} message to conversation {conversation_id}")
    return message


async def get_conversation_history(
    conversation_id: str,
    user_id: str,
    session: AsyncSession,
    limit: int = 100
) -> List[Message]:
    """
    Get conversation message history.

    Args:
        conversation_id: Conversation identifier (UUID string)
        user_id: User identifier for validation (UUID string)
        session: Database session
        limit: Maximum number of messages to return

    Returns:
        List of Message objects ordered by creation time
    """
    # First verify user owns this conversation
    conversation = await get_conversation(conversation_id, user_id, session)
    if not conversation:
        logger.warning(f"Unauthorized access attempt to conversation {conversation_id} by user {user_id}")
        return []

    # Get messages
    query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    result = await session.execute(query)
    messages = result.scalars().all()

    logger.info(f"Retrieved {len(messages)} messages from conversation {conversation_id}")
    return messages


async def get_or_create_conversation(
    user_id: str,
    session: AsyncSession,
    conversation_id: Optional[str] = None
) -> Conversation:
    """
    Get existing conversation or create new one.

    Args:
        user_id: User identifier (UUID string)
        session: Database session
        conversation_id: Optional existing conversation ID (UUID string)

    Returns:
        Conversation object
    """
    if conversation_id:
        conversation = await get_conversation(conversation_id, user_id, session)
        if conversation:
            return conversation
        logger.warning(f"Conversation {conversation_id} not found, creating new one")

    # Create new conversation
    return await create_conversation(user_id, session)
