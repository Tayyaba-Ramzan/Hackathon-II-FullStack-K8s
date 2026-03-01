# Quickstart Guide: Todo AI Chatbot

**Feature**: 004-todo-ai-chatbot
**Date**: 2026-02-26
**Purpose**: Quick reference for developers implementing the AI-powered conversational task management system

## Overview

This feature adds a conversational AI interface for managing todos via natural language. Users interact with a chatbot that interprets commands and executes task operations through MCP tools.

## Architecture Summary

```
User → ChatKit UI (Frontend) → FastAPI API → OpenAI Agents SDK → MCP Tools → Neon PostgreSQL
                                    ↓
                            Conversation History
```

**Key Components**:
- **Frontend**: Next.js + ChatKit UI (conversational interface)
- **Backend**: FastAPI + OpenAI Agents SDK (stateless API server)
- **MCP Tools**: 5 tools for task operations (add, list, complete, delete, update)
- **Database**: Neon PostgreSQL (tasks, conversations, messages)

## Prerequisites

**Required**:
- Python 3.11+
- Node.js 18+
- Neon PostgreSQL database
- OpenAI API key
- Better Auth configured

**Environment Variables**:
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host/db
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
BETTER_AUTH_SECRET=your-auth-secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
backend/
├── src/
│   ├── models/          # SQLModel entities (Task, Conversation, Message)
│   ├── services/        # Business logic (conversation_service, agent_service)
│   ├── api/             # FastAPI routes (/api/{user_id}/chat)
│   ├── mcp/             # MCP tool implementations
│   ├── db/              # Database connection and migrations
│   └── auth/            # Better Auth integration
└── tests/

frontend/
├── src/
│   ├── components/      # ChatKit UI components
│   ├── app/             # Next.js App Router pages
│   ├── services/        # API client
│   └── hooks/           # React hooks
└── tests/
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install fastapi uvicorn sqlmodel psycopg2-binary openai python-jose[cryptography] python-multipart
```

### 2. Database Schema

Run migrations to create tables:
```bash
python -m alembic upgrade head
```

Tables created:
- `users` (authentication)
- `tasks` (todo items)
- `conversations` (chat sessions)
- `messages` (chat messages)

### 3. MCP Tools Implementation

Each tool in `backend/src/mcp/`:
- `add_task.py` - Create new task
- `list_tasks.py` - Retrieve user's tasks
- `complete_task.py` - Mark task as done
- `delete_task.py` - Remove task
- `update_task.py` - Modify task

All tools enforce user_id isolation and return structured responses.

### 4. OpenAI Agents SDK Configuration

```python
# backend/src/services/agent_service.py
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# System prompt defines agent behavior
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

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install next react react-dom @chatkit/ui
```

### 2. ChatKit Integration

```tsx
// frontend/src/components/ChatInterface.tsx
import { ChatInterface } from '@chatkit/ui';

export default function TodoChatbot() {
  const handleSendMessage = async (message: string) => {
    const response = await fetch(`${API_URL}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, conversation_id: conversationId })
    });
    return await response.json();
  };

  return <ChatInterface onSendMessage={handleSendMessage} />;
}
```

### 3. Start Frontend Server

```bash
cd frontend
npm run dev
```

App available at: `http://localhost:3000`

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

## Conversation Flow

The 7-step pipeline for each message:

1. **Receive message** - Validate user_id and input
2. **Fetch history** - Load conversation context from database
3. **Store user message** - Persist message before processing
4. **Run agent** - Execute OpenAI Agents SDK with full context
5. **Invoke MCP tools** - Agent calls tools as needed
6. **Store AI response** - Persist response and tool_calls
7. **Return response** - Send to frontend with conversation_id

## Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

Test categories:
- `tests/unit/` - MCP tool unit tests
- `tests/integration/` - API endpoint tests
- `tests/contract/` - API contract validation

### Frontend Tests

```bash
cd frontend
npm test
```

Test categories:
- Component tests for ChatKit integration
- API client tests
- Hook tests for state management

## Common Operations

### Create a Task
User: "Add a task to call mom tomorrow"
AI: Calls `add_task` tool, confirms creation

### List Tasks
User: "What do I need to do?"
AI: Calls `list_tasks` tool, formats response

### Complete Task
User: "Mark the groceries task as done"
AI: Calls `complete_task` tool, confirms completion

### Delete Task
User: "Delete my meeting task"
AI: Calls `delete_task` tool, confirms deletion

### Update Task
User: "Change my dentist appointment to next Friday"
AI: Calls `update_task` tool, confirms update

## Troubleshooting

### AI Not Calling Tools
- Check OpenAI API key is valid
- Verify system prompt includes tool definitions
- Check tool function signatures match OpenAI format

### Conversation History Not Loading
- Verify conversation_id exists in database
- Check user_id matches conversation owner
- Ensure database connection is active

### Frontend Not Connecting to Backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in FastAPI
- Ensure JWT token is valid

### Database Connection Issues
- Verify DATABASE_URL format
- Check Neon PostgreSQL is accessible
- Ensure connection pool is configured

## Performance Optimization

**Backend**:
- Connection pooling (10-20 connections)
- Async database queries
- Response streaming for long AI generations
- Caching for frequently accessed data

**Frontend**:
- Code splitting for ChatKit components
- Lazy loading for conversation history
- Optimistic UI updates
- WebSocket consideration for real-time updates

## Security Checklist

- ✅ JWT tokens validated on every request
- ✅ user_id verified before operations
- ✅ MCP tools enforce user isolation
- ✅ Database queries filtered by user_id
- ✅ Input validation on all endpoints
- ✅ Rate limiting configured (60 req/min)
- ✅ Environment variables for secrets
- ✅ HTTPS in production

## Deployment

### Backend Deployment
- Deploy to cloud platform (AWS, GCP, Azure)
- Configure environment variables
- Set up database migrations
- Enable monitoring and logging

### Frontend Deployment
- Deploy to Vercel or similar
- Configure environment variables
- Set up CDN for static assets
- Enable analytics

## Next Steps

After implementation:
1. Run `/sp.tasks` to generate task breakdown
2. Implement backend MCP tools
3. Implement frontend ChatKit UI
4. Integration testing
5. Performance optimization
6. Production deployment

## References

- [Spec](./spec.md) - Feature specification
- [Plan](./plan.md) - Implementation plan
- [Data Model](./data-model.md) - Database schema
- [Chat API Contract](./contracts/chat-api.md) - API documentation
- [MCP Tools Contract](./contracts/mcp-tools.md) - Tool documentation
