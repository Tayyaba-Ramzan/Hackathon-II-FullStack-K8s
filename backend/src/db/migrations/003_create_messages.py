"""
Migration 003: Create messages table.

Creates the messages table for storing individual chat messages in conversations.
"""
from sqlalchemy import text


async def upgrade(connection):
    """Create messages table with indexes and constraints."""
    await connection.execute(text("""
        -- Create enum type for message role
        DO $$ BEGIN
            CREATE TYPE message_role AS ENUM ('user', 'assistant');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS messages (
            message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID NOT NULL,
            role message_role NOT NULL,
            content TEXT NOT NULL,
            tool_calls JSONB,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            -- Foreign key constraint
            CONSTRAINT fk_messages_conversation_id
                FOREIGN KEY (conversation_id)
                REFERENCES conversations(conversation_id)
                ON DELETE CASCADE,

            -- Check constraints
            CONSTRAINT chk_messages_content_not_empty
                CHECK (LENGTH(content) > 0)
        );

        -- Create indexes for efficient queries
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
            ON messages(conversation_id);

        CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
            ON messages(conversation_id, created_at ASC);

        CREATE INDEX IF NOT EXISTS idx_messages_created_at
            ON messages(created_at);

        -- Create index on tool_calls JSONB for querying
        CREATE INDEX IF NOT EXISTS idx_messages_tool_calls
            ON messages USING GIN (tool_calls);
    """))


async def downgrade(connection):
    """Drop messages table and related objects."""
    await connection.execute(text("""
        DROP TABLE IF EXISTS messages CASCADE;
        DROP TYPE IF EXISTS message_role CASCADE;
    """))
