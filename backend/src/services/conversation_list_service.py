"""
Conversation List Service

Manages listing and retrieving user's conversations.
"""
from typing import List, Dict, Any, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import logging

from src.models.conversation import Conversation
from src.models.message import Message

logger = logging.getLogger(__name__)


async def get_user_conversations(
    user_id: str,
    session: AsyncSession,
    limit: int = 20,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Get user's conversations sorted by most recent activity.

    Args:
        user_id: User identifier (UUID string)
        session: Database session
        limit: Maximum number of conversations to return
        offset: Number of conversations to skip (for pagination)

    Returns:
        List of conversation dictionaries with metadata
    """
    # Query conversations for user, sorted by updated_at DESC
    query = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )

    result = await session.execute(query)
    conversations = result.scalars().all()

    # Build response with metadata
    conversations_data = []
    for conv in conversations:
        # Get message count for this conversation
        message_count_query = select(Message).where(
            Message.conversation_id == conv.id
        )
        message_result = await session.execute(message_count_query)
        message_count = len(message_result.scalars().all())

        # Get last message preview
        last_message_query = (
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_message_result = await session.execute(last_message_query)
        last_message = last_message_result.scalar_one_or_none()

        conversations_data.append({
            "conversation_id": conv.id,
            "title": f"Conversation {conv.id[:8]}",  # Generate title from ID
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
            "message_count": message_count,
            "last_message_preview": last_message.content[:100] if last_message else None
        })

    logger.info(f"Retrieved {len(conversations_data)} conversations for user {user_id}")
    return conversations_data


async def get_conversation_with_messages(
    conversation_id: str,
    user_id: str,
    session: AsyncSession,
    limit: int = 100
) -> Optional[Dict[str, Any]]:
    """
    Get conversation with its messages.

    Args:
        conversation_id: Conversation identifier (UUID string)
        user_id: User identifier for validation (UUID string)
        session: Database session
        limit: Maximum number of messages to return

    Returns:
        Dictionary with conversation and messages, or None if not found
    """
    # Get conversation with user_id validation
    conv_query = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )
    conv_result = await session.execute(conv_query)
    conversation = conv_result.scalar_one_or_none()

    if not conversation:
        logger.warning(f"Conversation {conversation_id} not found for user {user_id}")
        return None

    # Get messages
    messages_query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    messages_result = await session.execute(messages_query)
    messages = messages_result.scalars().all()

    messages_data = [
        {
            "message_id": msg.id,
            "role": msg.role.value,
            "content": msg.content,
            "tool_calls": [],  # Database doesn't have tool_calls column
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]

    return {
        "conversation_id": conversation.id,
        "title": f"Conversation {conversation.id[:8]}",  # Generate title from ID
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
        "messages": messages_data
    }
