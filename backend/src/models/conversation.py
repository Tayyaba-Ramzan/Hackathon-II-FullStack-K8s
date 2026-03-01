"""
Conversation model for Todo AI Chatbot.

Represents a chat session between a user and the AI.
"""
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Conversation(SQLModel, table=True):
    """
    Conversation model representing a chat session.

    Attributes:
        id: Unique identifier (UUID string)
        user_id: Foreign key to User (UUID string)
        created_at: Conversation start timestamp
        updated_at: Last message timestamp
    """
    __tablename__ = "conversations"
    __table_args__ = {'extend_existing': True}

    id: Optional[str] = Field(
        default=None,
        primary_key=True,
        nullable=False
    )

    user_id: str = Field(
        nullable=False,
        index=True
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440001",
                "created_at": "2026-02-26T10:00:00Z",
                "updated_at": "2026-02-26T10:30:00Z"
            }
        }
