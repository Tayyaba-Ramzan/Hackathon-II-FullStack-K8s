"""
Message model for Todo AI Chatbot.

Represents a single message in a conversation (user or AI).
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Message role enum: user or assistant."""
    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    """
    Message model representing a single chat message.

    Attributes:
        id: Unique identifier (UUID string)
        conversation_id: Foreign key to Conversation (UUID string)
        user_id: Foreign key to User (UUID string)
        role: Who sent the message (user or assistant)
        content: Message text content
        created_at: Message timestamp
    """
    __tablename__ = "messages"
    __table_args__ = {'extend_existing': True}

    id: Optional[str] = Field(
        default=None,
        primary_key=True,
        nullable=False
    )

    conversation_id: str = Field(
        nullable=False,
        index=True
    )

    user_id: str = Field(
        nullable=False,
        index=True
    )

    role: MessageRole = Field(
        nullable=False
    )

    content: str = Field(
        nullable=False
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "conversation_id": "550e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440002",
                "role": "user",
                "content": "Add a task to buy groceries",
                "created_at": "2026-02-26T10:00:00Z"
            }
        }
