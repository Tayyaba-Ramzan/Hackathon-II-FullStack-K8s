# Data Model: MCP Tools + Agent Backend

**Feature**: 005-mcp-tools-agent
**Date**: 2026-02-26
**Database**: Neon Serverless PostgreSQL

## Overview

This document defines the database schema for the MCP Tools + Agent Backend feature. The schema supports multi-user task management with conversational AI interface, maintaining conversation history and tool execution metadata.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (from Phase II)
│─────────────│
│ user_id PK  │
│ email       │
│ password    │
│ created_at  │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌──────────────┐   ┌──────────────┐
│    Task     │    │ Conversation │   │   Message    │
│─────────────│    │──────────────│   │──────────────│
│ task_id PK  │    │ conv_id PK   │   │ msg_id PK    │
│ user_id FK  │    │ user_id FK   │   │ conv_id FK   │
│ title       │    │ created_at   │   │ user_id FK   │
│ description │    │ updated_at   │   │ role         │
│ completed   │    └──────┬───────┘   │ content      │
│ created_at  │           │           │ tool_calls   │
│ updated_at  │           │ 1:N       │ created_at   │
└─────────────┘           │           └──────────────┘
                          └───────────────┘
```

## Entities

### 1. User (Existing from Phase II)

**Purpose**: Represents authenticated users of the system

**Fields**:
- `user_id` (UUID, PRIMARY KEY): Unique identifier
- `email` (VARCHAR(255), UNIQUE, NOT NULL): User email address
- `password_hash` (TEXT, NOT NULL): Bcrypt hashed password
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Account creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Last update timestamp

**Relationships**:
- One user has many tasks (1:N)
- One user has many conversations (1:N)
- One user has many messages (1:N)

**Indexes**:
- PRIMARY KEY on `user_id`
- UNIQUE INDEX on `email`

**Validation Rules**:
- Email must be valid format
- Password must be hashed (never store plain text)
- Email must be unique across all users

**Notes**: This entity already exists from Phase II. No modifications needed.

---

### 2. Task (Existing from Phase II)

**Purpose**: Represents a todo item belonging to a user

**Fields**:
- `task_id` (UUID, PRIMARY KEY): Unique identifier
- `user_id` (UUID, FOREIGN KEY → User.user_id, NOT NULL): Owner of the task
- `title` (VARCHAR(255), NOT NULL): Task title/summary
- `description` (TEXT, NULLABLE): Detailed task description
- `completed` (BOOLEAN, NOT NULL, DEFAULT FALSE): Completion status
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Task creation timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Last modification timestamp

**Relationships**:
- Many tasks belong to one user (N:1)

**Indexes**:
- PRIMARY KEY on `task_id`
- INDEX on `user_id` (for user isolation queries)
- INDEX on `created_at` (for sorting)
- COMPOSITE INDEX on `(user_id, completed)` (for filtered lists)

**Validation Rules**:
- Title must not be empty (1-255 characters)
- Description max length: 5000 characters
- user_id must reference existing user
- completed must be boolean

**State Transitions**:
- Created → Incomplete (completed=false)
- Incomplete → Complete (completed=true)
- Complete → Incomplete (can be uncompleted)

**Notes**: This entity already exists from Phase II. No modifications needed.

---

### 3. Conversation (New for Phase III)

**Purpose**: Represents a chat session between user and AI agent

**Fields**:
- `conversation_id` (UUID, PRIMARY KEY): Unique identifier
- `user_id` (UUID, FOREIGN KEY → User.user_id, NOT NULL): Owner of the conversation
- `title` (VARCHAR(255), NULLABLE): Optional conversation title (auto-generated from first message)
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Conversation start timestamp
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Last message timestamp

**Relationships**:
- Many conversations belong to one user (N:1)
- One conversation has many messages (1:N)

**Indexes**:
- PRIMARY KEY on `conversation_id`
- INDEX on `user_id` (for user isolation queries)
- INDEX on `updated_at` (for sorting conversation list)
- COMPOSITE INDEX on `(user_id, updated_at DESC)` (for recent conversations)

**Validation Rules**:
- user_id must reference existing user
- title max length: 255 characters
- updated_at must be >= created_at

**Lifecycle**:
- Created automatically on first message if no conversation_id provided
- Updated timestamp refreshed on each new message
- Never deleted (conversation history preserved)

**Notes**:
- Title can be auto-generated from first user message (first 50 chars)
- Conversations are never deleted to maintain audit trail
- Soft delete could be added in future with `deleted_at` field

---

### 4. Message (New for Phase III)

**Purpose**: Represents a single message in a conversation (user or assistant)

**Fields**:
- `message_id` (UUID, PRIMARY KEY): Unique identifier
- `conversation_id` (UUID, FOREIGN KEY → Conversation.conversation_id, NOT NULL): Parent conversation
- `user_id` (UUID, FOREIGN KEY → User.user_id, NOT NULL): Owner (for isolation)
- `role` (ENUM('user', 'assistant'), NOT NULL): Message sender role
- `content` (TEXT, NOT NULL): Message text content
- `tool_calls` (JSONB, NULLABLE): Tool invocations metadata (for assistant messages)
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT NOW()): Message timestamp

**Relationships**:
- Many messages belong to one conversation (N:1)
- Many messages belong to one user (N:1)

**Indexes**:
- PRIMARY KEY on `message_id`
- INDEX on `conversation_id` (for conversation history queries)
- INDEX on `user_id` (for user isolation)
- INDEX on `created_at` (for chronological ordering)
- COMPOSITE INDEX on `(conversation_id, created_at ASC)` (for ordered history)

**Validation Rules**:
- conversation_id must reference existing conversation
- user_id must reference existing user
- user_id must match conversation.user_id (enforced at application level)
- role must be 'user' or 'assistant'
- content must not be empty (1-10000 characters)
- tool_calls must be valid JSON if present

**tool_calls JSON Structure**:
```json
[
  {
    "tool": "add_task",
    "parameters": {
      "title": "Buy groceries",
      "description": "Milk, eggs, bread"
    },
    "result": "success",
    "task_id": "uuid-here"
  }
]
```

**Lifecycle**:
- User messages created before agent processing
- Assistant messages created after agent response
- Never updated after creation (immutable)
- Never deleted (conversation history preserved)

**Notes**:
- tool_calls only present for assistant messages that invoked tools
- Messages are immutable once created (audit trail)
- JSONB type allows efficient querying of tool_calls if needed

---

## Database Migrations

### Migration 002: Create Conversations Table

**File**: `backend/src/db/migrations/002_create_conversations.py`

```sql
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);
```

**Rollback**:
```sql
DROP TABLE IF EXISTS conversations CASCADE;
```

---

### Migration 003: Create Messages Table

**File**: `backend/src/db/migrations/003_create_messages.py`

```sql
CREATE TYPE message_role AS ENUM ('user', 'assistant');

CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
```

**Rollback**:
```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TYPE IF EXISTS message_role;
```

---

## Query Patterns

### Common Queries

**1. Get user's recent conversations**:
```sql
SELECT conversation_id, title, created_at, updated_at
FROM conversations
WHERE user_id = $1
ORDER BY updated_at DESC
LIMIT 20;
```

**2. Get conversation history**:
```sql
SELECT message_id, role, content, tool_calls, created_at
FROM messages
WHERE conversation_id = $1 AND user_id = $2
ORDER BY created_at ASC;
```

**3. Get user's tasks (filtered)**:
```sql
SELECT task_id, title, description, completed, created_at, updated_at
FROM tasks
WHERE user_id = $1 AND completed = $2
ORDER BY created_at DESC;
```

**4. Get conversation with message count**:
```sql
SELECT c.conversation_id, c.title, c.created_at, c.updated_at, COUNT(m.message_id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.conversation_id = m.conversation_id
WHERE c.user_id = $1
GROUP BY c.conversation_id
ORDER BY c.updated_at DESC;
```

---

## Performance Considerations

### Index Strategy

- **User isolation**: All tables indexed on `user_id` for fast filtering
- **Time-based queries**: Indexes on `created_at` and `updated_at` for sorting
- **Conversation history**: Composite index on `(conversation_id, created_at)` for ordered retrieval
- **Recent conversations**: Composite index on `(user_id, updated_at DESC)` for dashboard

### Connection Pooling

- Pool size: 10-20 connections
- Max overflow: 20 additional connections
- Pool timeout: 30 seconds
- Pool recycle: 3600 seconds (1 hour)

### Query Optimization

- Use `LIMIT` for paginated results
- Avoid `SELECT *` - specify needed columns
- Use prepared statements (SQLModel handles this)
- Batch inserts when possible

---

## Data Integrity

### Foreign Key Constraints

- `tasks.user_id` → `users.user_id` (ON DELETE CASCADE)
- `conversations.user_id` → `users.user_id` (ON DELETE CASCADE)
- `messages.conversation_id` → `conversations.conversation_id` (ON DELETE CASCADE)
- `messages.user_id` → `users.user_id` (ON DELETE CASCADE)

### Cascade Behavior

- Deleting a user deletes all their tasks, conversations, and messages
- Deleting a conversation deletes all its messages
- This maintains referential integrity and prevents orphaned records

### Validation at Application Level

- user_id in message must match conversation.user_id
- Tool parameters validated before execution
- Message content length limits enforced
- JSONB structure validated for tool_calls

---

## Security Considerations

### User Isolation

- All queries MUST filter by user_id
- MCP tools enforce user_id parameter
- API middleware validates user_id from JWT
- Database constraints prevent orphaned records

### Data Privacy

- Passwords stored as bcrypt hashes only
- No PII in logs or error messages
- Conversation history private to user
- Tool_calls metadata does not expose system internals

---

## Future Enhancements

### Potential Schema Extensions

- **Conversation tags/categories**: Add `tags` JSONB field to conversations
- **Message reactions**: Add reactions table for user feedback
- **Conversation sharing**: Add permissions table for shared conversations
- **Soft delete**: Add `deleted_at` timestamp for soft deletion
- **Message edits**: Add `edited_at` and `original_content` for edit history
- **Conversation templates**: Add templates table for common conversation starters

### Performance Optimizations

- **Partitioning**: Partition messages table by created_at for large datasets
- **Archiving**: Move old conversations to archive table
- **Caching**: Cache recent conversations in Redis
- **Read replicas**: Use read replicas for conversation history queries
