# Quickstart Guide: MCP Tools + Agent Backend

**Feature**: 005-mcp-tools-agent
**Date**: 2026-02-26
**Purpose**: Quick reference for developers implementing the MCP tools and AI agent backend

## Overview

This feature implements the backend infrastructure for AI-powered conversational task management. It provides five MCP tools for task operations, an AI agent that interprets natural language, and a stateless conversation system with database persistence.

## Architecture Summary

```
User Message → FastAPI API → Agent Service → OpenAI SDK → MCP Tools → Database
                    ↓                                          ↓
            Conversation History                         Task Operations
```

**Key Components**:
- **MCP Tools**: 5 tools for task CRUD operations (add, list, complete, delete, update)
- **Agent Service**: Natural language processing with OpenAI SDK
- **Conversation Service**: Message persistence and history management
- **Chat API**: POST /api/{user_id}/chat endpoint with 7-step pipeline
- **Database**: Neon PostgreSQL (tasks, conversations, messages tables)

## Prerequisites

**Required**:
- Python 3.11+
- Neon PostgreSQL database
- OpenAI API key
- Better Auth configured (from Phase II)

**Environment Variables**:
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host/db
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
BETTER_AUTH_SECRET=your-auth-secret
```

## Project Structure

```
backend/
├── src/
│   ├── models/              # SQLModel entities
│   │   ├── conversation.py
│   │   ├── message.py
│   │   └── task.py (from Phase II)
│   ├── services/            # Business logic
│   │   ├── agent_service.py
│   │   ├── conversation_service.py
│   │   ├── openai_client.py
│   │   └── response_formatter.py
│   ├── mcp/                 # MCP tool implementations
│   │   ├── add_task.py
│   │   ├── list_tasks.py
│   │   ├── complete_task.py
│   │   ├── delete_task.py
│   │   ├── update_task.py
│   │   └── registry.py
│   ├── api/                 # FastAPI routes
│   │   ├── chat.py
│   │   └── conversations.py
│   ├── db/                  # Database layer
│   │   ├── connection.py
│   │   └── migrations/
│   └── auth/                # Authentication
│       ├── middleware.py
│       └── utils.py
└── tests/
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install fastapi uvicorn sqlmodel asyncpg openai python-jose bcrypt pydantic
```

### 2. Database Schema

Run migrations to create tables:
```bash
python -m backend.src.db.migrations.002_create_conversations
python -m backend.src.db.migrations.003_create_messages
```

Tables created:
- `conversations` (conversation_id, user_id, title, timestamps)
- `messages` (message_id, conversation_id, user_id, role, content, tool_calls, created_at)
- `tasks` (already exists from Phase II)

### 3. MCP Tools Implementation

Each tool in `backend/src/mcp/`:
- `add_task.py` - Create new task
- `list_tasks.py` - Retrieve user's tasks
- `complete_task.py` - Mark task as done
- `delete_task.py` - Remove task
- `update_task.py` - Modify task

All tools:
- Enforce user_id isolation
- Return structured responses: `{success, message, data}`
- Validate parameters
- Handle errors gracefully

### 4. OpenAI Agent Configuration

```python
# backend/src/services/openai_client.py
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are a helpful task management assistant. You help users manage their todo list through natural conversation.

Available tools:
- add_task: Create a new task
- list_tasks: Show all tasks
- complete_task: Mark a task as done
- delete_task: Remove a task
- update_task: Modify a task

Always confirm actions and provide helpful responses.
"""
```

### 5. Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

API available at: `http://localhost:8000`
Docs available at: `http://localhost:8000/docs`

## API Usage

### Send Message to Chatbot

```bash
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries",
    "conversation_id": "optional-uuid"
  }'
```

**Response**:
```json
{
  "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "response": "I've added a task to buy groceries for you.",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {"title": "Buy groceries"},
      "result": "success",
      "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  ],
  "timestamp": "2026-02-26T10:30:00Z"
}
```

## 7-Step Conversation Pipeline

Every message follows this exact sequence:

1. **Receive message** - Validate user_id and input
2. **Fetch history** - Load conversation context from database
3. **Store user message** - Persist message before processing
4. **Run agent** - Execute OpenAI agent with full context
5. **Invoke MCP tools** - Agent calls tools as needed
6. **Store AI response** - Persist response and tool_calls
7. **Return response** - Send to client with conversation_id

## MCP Tool Examples

### Add Task

```python
from backend.src.mcp.add_task import add_task

result = await add_task(
    user_id=UUID("..."),
    title="Buy groceries",
    description="Milk, eggs, bread"
)
# Returns: {success: true, message: "Task created", data: {...}}
```

### List Tasks

```python
from backend.src.mcp.list_tasks import list_tasks

# All tasks
result = await list_tasks(user_id=UUID("..."))

# Only incomplete tasks
result = await list_tasks(user_id=UUID("..."), completed=False)
```

### Complete Task

```python
from backend.src.mcp.complete_task import complete_task

result = await complete_task(
    user_id=UUID("..."),
    task_id=UUID("...")
)
```

### Delete Task

```python
from backend.src.mcp.delete_task import delete_task

result = await delete_task(
    user_id=UUID("..."),
    task_id=UUID("...")
)
```

### Update Task

```python
from backend.src.mcp.update_task import update_task

result = await update_task(
    user_id=UUID("..."),
    task_id=UUID("..."),
    title="New title",
    description="New description"
)
```

## Agent Service Usage

```python
from backend.src.services.agent_service import process_user_message

result = await process_user_message(
    user_message="Add a task to buy groceries",
    conversation_history=[],  # Previous messages
    user_id=UUID("..."),
    session=db_session
)

# Returns: {response: "...", tool_calls: [...]}
```

## Conversation Service Usage

### Create/Get Conversation

```python
from backend.src.services.conversation_service import get_or_create_conversation

conversation = await get_or_create_conversation(
    user_id=UUID("..."),
    session=db_session,
    conversation_id=None  # Creates new if None
)
```

### Save Message

```python
from backend.src.services.conversation_service import save_message
from backend.src.models.message import MessageRole

await save_message(
    conversation_id=UUID("..."),
    role=MessageRole.USER,
    content="Add a task to buy groceries",
    session=db_session
)
```

### Get Conversation History

```python
from backend.src.services.conversation_service import get_conversation_history

history = await get_conversation_history(
    conversation_id=UUID("..."),
    session=db_session
)
# Returns: [{"role": "user", "content": "..."}, ...]
```

## Testing

### Unit Tests

```bash
cd backend
pytest tests/unit/
```

Test categories:
- `tests/unit/mcp/` - MCP tool unit tests
- `tests/unit/services/` - Service layer tests
- `tests/unit/models/` - Model validation tests

### Integration Tests

```bash
cd backend
pytest tests/integration/
```

Test categories:
- `tests/integration/api/` - API endpoint tests
- `tests/integration/db/` - Database operation tests

### Contract Tests

```bash
cd backend
pytest tests/contract/
```

Validates:
- MCP tool function signatures match OpenAI schemas
- API request/response formats match specification
- Database schema matches data model

## Common Operations

### Natural Language Examples

**Create Task**:
- "Add a task to buy groceries"
- "Create a task to call mom tomorrow"
- "Remind me to pay bills"

**List Tasks**:
- "What do I need to do?"
- "Show me my tasks"
- "What's on my todo list?"

**Complete Task**:
- "Mark the groceries task as done"
- "I finished buying groceries"
- "Complete the task about calling mom"

**Delete Task**:
- "Delete my meeting task"
- "Remove the task about laundry"
- "Get rid of the groceries task"

**Update Task**:
- "Change my dentist appointment to next Friday"
- "Update the groceries task to include milk"
- "Rename the task to something else"

## Troubleshooting

### Agent Not Calling Tools

**Symptoms**: Agent responds but doesn't invoke MCP tools

**Solutions**:
- Check OpenAI API key is valid
- Verify system prompt includes tool definitions
- Check tool function signatures match OpenAI format
- Review agent logs for errors

### Conversation History Not Loading

**Symptoms**: Agent doesn't remember previous messages

**Solutions**:
- Verify conversation_id exists in database
- Check user_id matches conversation owner
- Ensure database connection is active
- Review conversation_service logs

### User Isolation Failures

**Symptoms**: Users can see other users' tasks

**Solutions**:
- Verify all queries filter by user_id
- Check JWT token validation in middleware
- Review MCP tool user_id enforcement
- Test with multiple user accounts

### Database Connection Issues

**Symptoms**: Connection errors or timeouts

**Solutions**:
- Verify DATABASE_URL format
- Check Neon PostgreSQL is accessible
- Ensure connection pool is configured
- Review connection pool size settings

### OpenAI API Errors

**Symptoms**: 429 rate limit or timeout errors

**Solutions**:
- Implement retry logic with exponential backoff
- Check OpenAI API quota and limits
- Consider request queuing for high load
- Review API timeout settings

## Performance Optimization

### Backend

- **Connection pooling**: 10-20 connections configured
- **Async operations**: All I/O is non-blocking
- **Database indexes**: user_id, conversation_id, created_at
- **Query optimization**: Parameterized queries, no N+1

### Database

- **Indexes**: On user_id, conversation_id, created_at
- **Connection pool**: Reuse connections efficiently
- **Query limits**: Use LIMIT for paginated results
- **Prepared statements**: SQLModel handles automatically

### OpenAI API

- **Timeout**: 30 seconds for API calls
- **Retry logic**: Exponential backoff on rate limits
- **Context management**: Only send necessary history
- **Token optimization**: Trim old messages if needed

## Security Checklist

- ✅ JWT tokens validated on every request
- ✅ user_id verified before operations
- ✅ MCP tools enforce user isolation
- ✅ Database queries filtered by user_id
- ✅ Input validation on all endpoints
- ✅ Rate limiting configured (60 req/min)
- ✅ Environment variables for secrets
- ✅ HTTPS in production
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (no HTML rendering)

## Deployment

### Environment Setup

1. Set environment variables in production
2. Configure database connection string
3. Set OpenAI API key
4. Configure JWT secret
5. Enable HTTPS

### Database Migrations

1. Run migrations before starting server
2. Test migrations on staging first
3. Have rollback scripts ready
4. Backup database before migrations

### Monitoring

Track:
- Request rate and response time
- Error rate by status code
- Tool invocation rate
- Database query time
- OpenAI API latency

### Scaling

- Horizontal scaling (multiple server instances)
- Database connection pooling
- Load balancer for traffic distribution
- Redis cache for frequently accessed data (optional)

## Next Steps

After implementation:
1. Run `/sp.tasks` to generate task breakdown
2. Implement MCP tools with user isolation
3. Implement agent service with OpenAI SDK
4. Implement conversation service with database persistence
5. Implement chat API endpoint with 7-step pipeline
6. Integration testing with full conversation flow
7. Performance optimization and monitoring
8. Production deployment

## References

- [Spec](./spec.md) - Feature specification
- [Plan](./plan.md) - Implementation plan
- [Data Model](./data-model.md) - Database schema
- [MCP Tools Contract](./contracts/mcp-tools.md) - Tool specifications
- [Chat API Contract](./contracts/chat-api.md) - API documentation
- [Research](./research.md) - Technical decisions
