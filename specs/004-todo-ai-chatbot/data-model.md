# Data Model: Todo AI Chatbot

**Feature**: 004-todo-ai-chatbot
**Date**: 2026-02-26
**Purpose**: Define database schema and entity relationships for conversational task management

## Entity Overview

The system manages four core entities: Users (authentication), Tasks (todo items), Conversations (chat sessions), and Messages (individual chat messages).

## Entities

### User

**Purpose**: Represents an authenticated user who owns tasks and conversations

**Attributes**:
- `user_id` (UUID, Primary Key): Unique identifier for the user
- `email` (String, Unique, Not Null): User's email address for authentication
- `password_hash` (String, Not Null): Hashed password (bcrypt/argon2)
- `created_at` (Timestamp, Not Null): Account creation timestamp
- `updated_at` (Timestamp, Not Null): Last account update timestamp

**Relationships**:
- One user has many tasks (1:N)
- One user has many conversations (1:N)

**Validation Rules**:
- Email must be valid format
- Password must be hashed before storage
- user_id is immutable after creation

**Indexes**:
- Primary key on user_id
- Unique index on email

---

### Task

**Purpose**: Represents a todo item owned by a user

**Attributes**:
- `task_id` (UUID, Primary Key): Unique identifier for the task
- `user_id` (UUID, Foreign Key → User, Not Null): Owner of the task
- `title` (String, Not Null): Brief task description
- `description` (Text, Nullable): Detailed task information
- `completed` (Boolean, Not Null, Default: false): Completion status
- `completed_at` (Timestamp, Nullable): When task was marked complete
- `created_at` (Timestamp, Not Null): Task creation timestamp
- `updated_at` (Timestamp, Not Null): Last task update timestamp

**Relationships**:
- Many tasks belong to one user (N:1)

**Validation Rules**:
- title must not be empty
- user_id must reference existing user
- completed_at must be null when completed is false
- completed_at must be set when completed is true

**State Transitions**:
- Created → Active (completed = false)
- Active → Completed (completed = true, completed_at = now)
- Completed → Active (completed = false, completed_at = null) [if reopened]
- Any state → Deleted (soft delete or hard delete)

**Indexes**:
- Primary key on task_id
- Index on (user_id, created_at) for efficient user task queries
- Index on (user_id, completed) for filtering by status

---

### Conversation

**Purpose**: Represents a chat session between a user and the AI

**Attributes**:
- `conversation_id` (UUID, Primary Key): Unique identifier for the conversation
- `user_id` (UUID, Foreign Key → User, Not Null): Owner of the conversation
- `title` (String, Nullable): Optional conversation title (can be auto-generated from first message)
- `created_at` (Timestamp, Not Null): Conversation start timestamp
- `updated_at` (Timestamp, Not Null): Last message timestamp

**Relationships**:
- Many conversations belong to one user (N:1)
- One conversation has many messages (1:N)

**Validation Rules**:
- user_id must reference existing user
- updated_at should update whenever a new message is added

**Indexes**:
- Primary key on conversation_id
- Index on (user_id, updated_at DESC) for recent conversations list

---

### Message

**Purpose**: Represents a single message in a conversation (user or AI)

**Attributes**:
- `message_id` (UUID, Primary Key): Unique identifier for the message
- `conversation_id` (UUID, Foreign Key → Conversation, Not Null): Parent conversation
- `role` (Enum: 'user' | 'assistant', Not Null): Who sent the message
- `content` (Text, Not Null): Message text content
- `tool_calls` (JSON, Nullable): Metadata about MCP tools invoked (for assistant messages)
- `created_at` (Timestamp, Not Null): Message timestamp

**Relationships**:
- Many messages belong to one conversation (N:1)

**Validation Rules**:
- conversation_id must reference existing conversation
- role must be either 'user' or 'assistant'
- content must not be empty
- tool_calls should only be present for assistant messages
- Messages are immutable after creation (no updates)

**tool_calls JSON Structure**:
```json
[
  {
    "tool": "add_task",
    "parameters": {"title": "Buy groceries", "description": "Milk, eggs, bread"},
    "result": "success",
    "task_id": "uuid-here"
  }
]
```

**Indexes**:
- Primary key on message_id
- Index on (conversation_id, created_at ASC) for chronological message retrieval
- Index on created_at for audit queries

---

## Relationships Diagram

```
User (1) ──────< (N) Task
  │
  └──────< (N) Conversation (1) ──────< (N) Message
```

## Database Constraints

### Foreign Key Constraints

- `Task.user_id` → `User.user_id` (ON DELETE CASCADE)
- `Conversation.user_id` → `User.user_id` (ON DELETE CASCADE)
- `Message.conversation_id` → `Conversation.conversation_id` (ON DELETE CASCADE)

**Rationale**: Cascade deletes ensure data consistency when users are deleted. All user data (tasks, conversations, messages) is removed.

### Unique Constraints

- `User.email` must be unique
- No other unique constraints needed (UUIDs are naturally unique)

### Check Constraints

- `Task.title` length > 0
- `Message.content` length > 0
- `Message.role` IN ('user', 'assistant')

## Query Patterns

### Common Queries

**Get user's tasks**:
```sql
SELECT * FROM tasks
WHERE user_id = ?
ORDER BY created_at DESC;
```

**Get conversation history**:
```sql
SELECT * FROM messages
WHERE conversation_id = ?
ORDER BY created_at ASC;
```

**Get user's recent conversations**:
```sql
SELECT * FROM conversations
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 20;
```

**Create new message and update conversation**:
```sql
-- Transaction
BEGIN;
INSERT INTO messages (message_id, conversation_id, role, content, tool_calls, created_at)
VALUES (?, ?, ?, ?, ?, NOW());
UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?;
COMMIT;
```

### Performance Considerations

- Indexes on (user_id, created_at) enable efficient user-scoped queries
- Conversation history queries are bounded by conversation_id (natural partitioning)
- Message pagination recommended for very long conversations (LIMIT/OFFSET)
- Connection pooling required for concurrent chat requests

## Migration Strategy

### Initial Schema Creation

1. Create User table
2. Create Task table with foreign key to User
3. Create Conversation table with foreign key to User
4. Create Message table with foreign key to Conversation
5. Create all indexes

### Data Migration (if applicable)

If migrating from existing Phase II todo app:
- User table already exists (no changes needed)
- Task table already exists (no changes needed)
- Conversation and Message tables are new (create empty)

## Audit and Compliance

**Audit Trail**:
- All entities have created_at timestamps
- Tasks and Conversations have updated_at timestamps
- Messages are immutable (created_at only)
- tool_calls JSON provides operation audit trail

**Data Retention**:
- No automatic deletion policy (indefinite retention)
- Users can manually delete conversations
- Deleted conversations cascade to messages

**Privacy**:
- User isolation enforced via user_id foreign keys
- No cross-user queries possible at database level
- Conversation content is user-private
