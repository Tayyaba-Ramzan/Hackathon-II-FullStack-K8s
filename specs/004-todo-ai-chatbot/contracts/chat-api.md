# Chat API Contract

**Endpoint**: `POST /api/{user_id}/chat`

**Purpose**: Send a message to the AI chatbot and receive a response with optional task operations

**Authentication**: Required (JWT token in Authorization header)

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID | Yes | Authenticated user's unique identifier |

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | String | Yes | Bearer JWT token |
| Content-Type | String | Yes | Must be "application/json" |

### Body

```json
{
  "message": "string (required, 1-5000 chars)",
  "conversation_id": "uuid (optional)"
}
```

**Fields**:
- `message`: User's natural language input
- `conversation_id`: Optional. If provided, continues existing conversation. If omitted, creates new conversation.

**Validation**:
- `message` must not be empty
- `message` length must be between 1 and 5000 characters
- `conversation_id` must be valid UUID if provided
- `conversation_id` must belong to authenticated user

## Response

### Success Response (200 OK)

```json
{
  "conversation_id": "uuid",
  "response": "string",
  "tool_calls": [
    {
      "tool": "string",
      "parameters": {},
      "result": "string",
      "task_id": "uuid (optional)"
    }
  ],
  "timestamp": "ISO 8601 datetime"
}
```

**Fields**:
- `conversation_id`: UUID of the conversation (new or existing)
- `response`: AI-generated natural language response
- `tool_calls`: Array of MCP tools invoked during processing (empty if no tools used)
- `timestamp`: When the response was generated

**tool_calls Structure**:
- `tool`: Name of MCP tool invoked (add_task, list_tasks, complete_task, delete_task, update_task)
- `parameters`: Input parameters passed to the tool
- `result`: "success" or "error"
- `task_id`: UUID of affected task (if applicable)

### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Bad Request",
  "message": "Message cannot be empty",
  "timestamp": "ISO 8601 datetime"
}
```

**401 Unauthorized** - Missing or invalid JWT token
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "timestamp": "ISO 8601 datetime"
}
```

**403 Forbidden** - User trying to access another user's conversation
```json
{
  "error": "Forbidden",
  "message": "You do not have access to this conversation",
  "timestamp": "ISO 8601 datetime"
}
```

**404 Not Found** - Conversation not found
```json
{
  "error": "Not Found",
  "message": "Conversation not found",
  "timestamp": "ISO 8601 datetime"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "ISO 8601 datetime"
}
```

**503 Service Unavailable** - AI service unavailable
```json
{
  "error": "Service Unavailable",
  "message": "AI service is temporarily unavailable. Please try again.",
  "timestamp": "ISO 8601 datetime"
}
```

## Examples

### Example 1: Create Task

**Request**:
```json
POST /api/550e8400-e29b-41d4-a716-446655440000/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "Add a task to buy groceries tomorrow"
}
```

**Response**:
```json
{
  "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "response": "I've added a task to buy groceries tomorrow. Is there anything specific you need to get?",
  "tool_calls": [
    {
      "tool": "add_task",
      "parameters": {
        "title": "Buy groceries",
        "description": "Tomorrow"
      },
      "result": "success",
      "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  ],
  "timestamp": "2026-02-26T10:30:00Z"
}
```

### Example 2: List Tasks

**Request**:
```json
POST /api/550e8400-e29b-41d4-a716-446655440000/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "What tasks do I have?",
  "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Response**:
```json
{
  "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "response": "You have 2 tasks:\n1. Buy groceries (not completed)\n2. Call mom (not completed)",
  "tool_calls": [
    {
      "tool": "list_tasks",
      "parameters": {},
      "result": "success"
    }
  ],
  "timestamp": "2026-02-26T10:31:00Z"
}
```

### Example 3: Complete Task

**Request**:
```json
POST /api/550e8400-e29b-41d4-a716-446655440000/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "Mark the groceries task as done",
  "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Response**:
```json
{
  "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "response": "Great! I've marked 'Buy groceries' as completed.",
  "tool_calls": [
    {
      "tool": "complete_task",
      "parameters": {
        "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      },
      "result": "success",
      "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  ],
  "timestamp": "2026-02-26T10:32:00Z"
}
```

## Rate Limiting

- 60 requests per minute per user
- 429 Too Many Requests response if exceeded

## Performance SLA

- P95 response time: < 3 seconds
- P99 response time: < 5 seconds
- Availability: 99.9%
