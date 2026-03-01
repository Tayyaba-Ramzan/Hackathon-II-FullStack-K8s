"""
Conversations API Endpoints

Implements endpoints for listing conversations and fetching conversation history.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
import logging

from src.db.connection import get_session
from src.auth.middleware import get_current_user
from src.auth.utils import get_authenticated_user_id
from src.services.conversation_list_service import (
    get_user_conversations,
    get_conversation_with_messages
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["conversations"])


# Response Models
class ConversationSummary(BaseModel):
    """Summary of a conversation for list view."""
    conversation_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int
    last_message_preview: Optional[str]


class ConversationsListResponse(BaseModel):
    """Response for conversations list endpoint."""
    conversations: List[ConversationSummary]
    total: int
    limit: int
    offset: int


class MessageDetail(BaseModel):
    """Detailed message information."""
    message_id: str
    role: str
    content: str
    tool_calls: Optional[List[dict]]
    created_at: str


class ConversationDetail(BaseModel):
    """Detailed conversation with messages."""
    conversation_id: str
    title: Optional[str]
    created_at: str
    updated_at: str
    messages: List[MessageDetail]


# Endpoints
@router.get("/{user_id}/conversations", response_model=ConversationsListResponse)
async def list_conversations(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    List user's conversations sorted by most recent activity.

    Args:
        user_id: User identifier from path
        limit: Maximum number of conversations to return (1-100)
        offset: Number of conversations to skip for pagination
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        List of conversations with metadata

    Raises:
        HTTPException: For validation or authorization errors
    """
    print(f"DEBUG: list_conversations called with user_id={user_id}")
    print(f"DEBUG: current_user={current_user}")

    try:
        # Validate user_id matches authenticated user
        print("DEBUG: About to call get_authenticated_user_id")
        validated_user_id = await get_authenticated_user_id(current_user, user_id)
        print(f"DEBUG: validated_user_id={validated_user_id}")

        # Convert integer user_id to string for conversation tables
        user_id_str = str(validated_user_id)
        print(f"DEBUG: user_id_str={user_id_str}")

        # Get conversations
        print("DEBUG: About to call get_user_conversations")
        conversations = await get_user_conversations(
            user_id=user_id_str,
            session=session,
            limit=limit,
            offset=offset
        )
        print(f"DEBUG: Got {len(conversations)} conversations")

        logger.info(f"Listed {len(conversations)} conversations for user {user_id}")

        return ConversationsListResponse(
            conversations=[ConversationSummary(**conv) for conv in conversations],
            total=len(conversations),
            limit=limit,
            offset=offset
        )

    except HTTPException:
        print("DEBUG: HTTPException caught")
        raise
    except Exception as e:
        print(f"DEBUG: Exception caught: {e}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error listing conversations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversations: {str(e)}"
        )


@router.get(
    "/{user_id}/conversations/{conversation_id}/messages",
    response_model=ConversationDetail
)
async def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get conversation history with all messages.

    Args:
        user_id: User identifier from path
        conversation_id: Conversation identifier
        limit: Maximum number of messages to return (1-500)
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        Conversation with messages

    Raises:
        HTTPException: For validation, authorization, or not found errors
    """
    try:
        # Validate user_id matches authenticated user
        validated_user_id = await get_authenticated_user_id(current_user, user_id)

        # Convert integer user_id to string for conversation tables
        user_id_str = str(validated_user_id)

        # Get conversation with messages
        conversation = await get_conversation_with_messages(
            conversation_id=conversation_id,
            user_id=user_id_str,
            session=session,
            limit=limit
        )

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or access denied"
            )

        logger.info(f"Retrieved conversation {conversation_id} for user {user_id}")

        return ConversationDetail(**conversation)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation"
        )
