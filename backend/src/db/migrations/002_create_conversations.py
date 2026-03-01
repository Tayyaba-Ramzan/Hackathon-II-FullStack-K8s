"""
Migration 002: Create conversations table.

Creates the conversations table for storing chat sessions between users and AI.
"""
from sqlalchemy import text


async def upgrade(connection):
    """Create conversations table with indexes and constraints."""
    await connection.execute(text("""
        CREATE TABLE IF NOT EXISTS conversations (
            conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            title VARCHAR(255),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            -- Foreign key constraint
            CONSTRAINT fk_conversations_user_id
                FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );

        -- Create indexes for efficient queries
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id
            ON conversations(user_id);

        CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
            ON conversations(user_id, updated_at DESC);

        -- Create trigger to auto-update updated_at
        CREATE OR REPLACE FUNCTION update_conversations_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_conversations_updated_at
            BEFORE UPDATE ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_conversations_updated_at();
    """))


async def downgrade(connection):
    """Drop conversations table and related objects."""
    await connection.execute(text("""
        DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
        DROP FUNCTION IF EXISTS update_conversations_updated_at();
        DROP TABLE IF EXISTS conversations CASCADE;
    """))
