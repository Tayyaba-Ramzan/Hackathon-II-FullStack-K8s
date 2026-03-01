"""
Chat API Endpoint

Implements POST /api/{user_id}/chat for conversational task management.
Follows 7-step conversation flow: receive → fetch → store → agent → tools → store → respond
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
import logging
import time

from src.db.connection import get_session
from src.auth.middleware import get_current_user
from src.auth.utils import get_authenticated_user_id
from src.services.conversation_service import (
    get_or_create_conversation,
    save_message,
    get_conversation_history
)
from src.services.agent_service import process_user_message, handle_agent_error
from src.services.logger import request_logger
from src.models.message import MessageRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=5000)
    conversation_id: Optional[str] = None

    @validator('message')
    def message_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()


class ToolCall(BaseModel):
    """Tool call metadata in response."""
    tool: str
    parameters: Dict[str, Any]
    result: str
    task_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    conversation_id: str
    response: str
    tool_calls: List[ToolCall]
    timestamp: datetime


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    message: str
    timestamp: datetime


# Chat Endpoint
@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Send a message to the AI chatbot and receive a response.

    Implements 7-step conversation flow:
    1. Receive message (validate input)
    2. Fetch conversation history
    3. Store user message
    4. Run AI agent with context
    5. Invoke MCP tools as needed
    6. Store AI response
    7. Return response to user

    Args:
        user_id: User identifier from path
        request: Chat request with message and optional conversation_id
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        ChatResponse with conversation_id, response, and tool_calls

    Raises:
        HTTPException: For validation errors, auth errors, or server errors
    """
    start_time = time.time()
    request_path = f"/api/{user_id}/chat"

    # Log incoming request
    request_logger.log_request(
        method="POST",
        path=request_path,
        user_id=user_id
    )

    try:
        # Step 1: Receive and validate
        logger.info(f"Received chat message from user {user_id}")

        # Validate user_id matches authenticated user
        validated_user_id = await get_authenticated_user_id(current_user, user_id)

        # Convert integer user_id to string for conversation/message tables
        user_id_str = str(validated_user_id)

        # Validate message length
        if len(request.message) > 5000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message exceeds maximum length of 5000 characters"
            )

        # Get or create conversation
        try:
            conversation = await get_or_create_conversation(
                user_id=user_id_str,
                session=session,
                conversation_id=request.conversation_id
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )

        # Step 2: Fetch conversation history
        conversation_history_messages = await get_conversation_history(
            conversation_id=conversation.id,
            user_id=user_id_str,
            session=session
        )

        # Transform Message objects to dict format for agent
        conversation_history = [
            {
                "role": msg.role.value,
                "content": msg.content
            }
            for msg in conversation_history_messages
        ]

        # Step 3: Store user message
        await save_message(
            conversation_id=conversation.id,
            user_id=user_id_str,
            role=MessageRole.USER,
            content=request.message,
            session=session
        )

        # Step 4 & 5: Run agent and invoke MCP tools
        try:
            agent_result = await process_user_message(
                user_message=request.message,
                conversation_history=conversation_history,
                user_id=user_id_str,
                session=session
            )
        except Exception as e:
            logger.error(f"Agent processing error: {str(e)}")
            error_message = await handle_agent_error(e)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_message
            )

        # Step 6: Store AI response
        await save_message(
            conversation_id=conversation.id,
            user_id=user_id_str,
            role=MessageRole.ASSISTANT,
            content=agent_result["response"],
            session=session
        )

        # Step 7: Return response
        response = ChatResponse(
            conversation_id=conversation.id,
            response=agent_result["response"],
            tool_calls=[
                ToolCall(**tool_call)
                for tool_call in agent_result["tool_calls"]
            ],
            timestamp=datetime.utcnow()
        )

        # Log successful response
        duration_ms = (time.time() - start_time) * 1000
        request_logger.log_response(
            method="POST",
            path=request_path,
            status_code=200,
            duration_ms=duration_ms,
            user_id=user_id
        )

        logger.info(f"Chat response sent for conversation {conversation.id}")
        return response

    except HTTPException as e:
        # Log HTTP exceptions
        duration_ms = (time.time() - start_time) * 1000
        request_logger.log_response(
            method="POST",
            path=request_path,
            status_code=e.status_code,
            duration_ms=duration_ms,
            user_id=user_id
        )
        raise

    except Exception as e:
        # Log unexpected errors
        duration_ms = (time.time() - start_time) * 1000
        request_logger.log_error(
            error=e,
            method="POST",
            path=request_path,
            user_id=user_id
        )
        request_logger.log_response(
            method="POST",
            path=request_path,
            status_code=500,
            duration_ms=duration_ms,
            user_id=user_id
        )

        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
