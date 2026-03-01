# Chat API Contract

**Feature**: 005-mcp-tools-agent
**Date**: 2026-02-26
**Version**: 1.0.0

## Overview

This document specifies the REST API contract for the conversational AI chat endpoint. This endpoint implements the 7-step conversation pipeline and serves as the primary interface between the frontend and the AI agent.

## Base URL

```
http://localhost:8000  (development)
https://api.example.com  (production)
```

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <jwt_token>
```

The JWT token must contain:
- `user_id`: UUID of the authenticated user
- `exp`: Token expiration timestamp
- `iat`: Token issued at timestamp

## Endpoint: Send Chat Message

### POST /api/{user_id}/chat

Send a message to the AI agent and receive a response with optional tool invocations.

### URL Parameters

- `user_id` (UUID, required): User identifier from authenticated session

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Request Body

```json
{
    "message": "string (required, 1-5000 characters)",
    "conversation_id": "uuid (optional)"
}
```

**Fields**:
- `message` (string, required): User's message text
  - Min length: 1 character
  - Max length: 5000 characters
  - Must not be empty or whitespace only
- `conversation_id` (UUID, optional): Existing conversation ID to continue
  - If omitted, a new conversation is created
  - If provided, must belong to the authenticated user

### Response

**Status Code**: 200 OK

**Response Body**:
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
- `conversation_id` (UUID): Conversation identifier for continuity
- `response` (string): AI agent's response text
- `tool_calls` (array): List of MCP tools invoked (empty if none)
  - `tool` (string): Tool name (add_task, list_tasks, etc.)
  - `parameters` (object): Parameters passed to the tool
  - `result` (string): Tool execution result (success/error)
  - `task_id` (UUID, optional): Created/modified task ID if applicable
- `timestamp` (string): Response generation timestamp (ISO 8601)

### Example Request

```http
POST /api/550e8400-e29b-41d4-a716-446655440000/chat HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "message": "Add a task to buy groceries",
    "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

### Example Response (With Tool Call)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "response": "I've added a task to buy groceries for you.",
    "tool_calls": [
        {
            "tool": "add_task",
            "parameters": {
                "title": "Buy groceries",
                "description": null
            },
            "result": "success",
            "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        }
    ],
    "timestamp": "2026-02-26T10:30:00Z"
}
```

### Example Response (No Tool Call)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "conversation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "response": "Hello! I'm your task management assistant. I can help you add, list, complete, update, or delete tasks. What would you like to do?",
    "tool_calls": [],
    "timestamp": "2026-02-26T10:30:00Z"
}
```

### Error Responses

#### 400 Bad Request - Invalid Input

```json
{
    "error": "Validation Error",
    "message": "Message cannot be empty",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- Empty or whitespace-only message
- Message exceeds 5000 characters
- Invalid conversation_id format
- Missing required fields

#### 401 Unauthorized - Authentication Failed

```json
{
    "error": "Unauthorized",
    "message": "Invalid or expired token",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- Missing Authorization header
- Invalid JWT token
- Expired JWT token
- Token signature verification failed

#### 403 Forbidden - Access Denied

```json
{
    "error": "Forbidden",
    "message": "Access denied to this conversation",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- user_id in URL doesn't match JWT token
- conversation_id belongs to different user
- User attempting to access another user's data

#### 404 Not Found - Conversation Not Found

```json
{
    "error": "Not Found",
    "message": "Conversation not found",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- Provided conversation_id doesn't exist
- Conversation was deleted

#### 429 Too Many Requests - Rate Limit Exceeded

```json
{
    "error": "Rate Limit Exceeded",
    "message": "Too many requests. Please try again in 60 seconds.",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- User exceeded rate limit (60 requests per minute)

#### 500 Internal Server Error - Server Error

```json
{
    "error": "Internal Server Error",
    "message": "An unexpected error occurred",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- Database connection failure
- OpenAI API error
- Unhandled exception in server code

#### 503 Service Unavailable - External Service Error

```json
{
    "error": "Service Unavailable",
    "message": "AI service is temporarily unavailable. Please try again.",
    "timestamp": "2026-02-26T10:30:00Z"
}
```

**Causes**:
- OpenAI API unavailable
- OpenAI API rate limit exceeded
- Database unavailable

---

## 7-Step Conversation Pipeline

The endpoint implements this exact sequence for every request:

1. **Receive message**: Validate request body and authentication
2. **Fetch history**: Load conversation history from database by conversation_id
3. **Store user message**: Persist user message to messages table
4. **Run agent**: Execute OpenAI agent with full conversation context
5. **Invoke MCP tools**: Agent calls tools as needed (add_task, list_tasks, etc.)
6. **Store AI response**: Persist assistant message and tool_calls to messages table
7. **Return response**: Send conversation_id, response, and tool_calls to client

### Pipeline Guarantees

- All steps execute in order (no parallelization)
- User message stored before agent processing (audit trail)
- Agent response stored before returning to client (recoverability)
- Conversation history includes all previous messages (context)
- Tool calls metadata preserved in database (transparency)

---

## Conversation Management

### New Conversation

When `conversation_id` is omitted:
1. New conversation record created with generated UUID
2. User message stored with new conversation_id
3. conversation_id returned in response for future messages

### Continuing Conversation

When `conversation_id` is provided:
1. Conversation existence and ownership verified
2. Full conversation history loaded (all previous messages)
3. New messages appended to existing conversation
4. Same conversation_id returned in response

### Conversation Recovery

Conversations persist across:
- Browser sessions (stateless API)
- Server restarts (database-backed)
- Multiple devices (conversation_id is portable)

---

## Security

### Authentication Enforcement

- JWT token validated on every request
- Token signature verified against secret
- Token expiration checked
- user_id extracted from token claims

### User Isolation

- user_id in URL must match JWT token user_id
- conversation_id ownership verified before access
- All database queries filtered by user_id
- MCP tools enforce user_id isolation

### Input Validation

- Message length validated (1-5000 characters)
- conversation_id format validated (UUID)
- SQL injection prevented (parameterized queries)
- XSS prevention (no HTML rendering)

### Rate Limiting

- 60 requests per minute per user
- Rate limit enforced at middleware level
- 429 status code returned when exceeded
- Retry-After header included in response

---

## Performance

### Response Time Targets

- **Without tool calls**: <1 second
- **With tool calls**: <2 seconds
- **Conversation history load**: <200ms (up to 100 messages)

### Optimization Strategies

- Database connection pooling (10-20 connections)
- Indexed queries on user_id and conversation_id
- Async/await for non-blocking I/O
- OpenAI API timeout: 30 seconds

### Scalability

- Stateless design enables horizontal scaling
- No session affinity required
- Database handles concurrent requests
- Connection pool prevents resource exhaustion

---

## Testing

### Contract Tests

Verify:
- ✅ Request/response schema matches specification
- ✅ All required fields present
- ✅ Field types correct (UUID, string, array, etc.)
- ✅ Error responses follow standard format

### Integration Tests

Verify:
- ✅ Full conversation flow (new conversation)
- ✅ Conversation continuation (existing conversation_id)
- ✅ Tool invocation and response
- ✅ Error handling (invalid input, auth failures)
- ✅ User isolation (cannot access other user's conversations)

### Load Tests

Verify:
- ✅ 100 concurrent requests handled
- ✅ Response time under load
- ✅ Rate limiting enforcement
- ✅ Database connection pool behavior

---

## Client Implementation Guide

### TypeScript Example

```typescript
interface ChatRequest {
    message: string;
    conversation_id?: string;
}

interface ChatResponse {
    conversation_id: string;
    response: string;
    tool_calls: ToolCall[];
    timestamp: string;
}

interface ToolCall {
    tool: string;
    parameters: Record<string, any>;
    result: string;
    task_id?: string;
}

async function sendMessage(
    userId: string,
    request: ChatRequest,
    token: string
): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/api/${userId}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}
```

### Usage Example

```typescript
// Start new conversation
const response1 = await sendMessage(
    userId,
    { message: "Add a task to buy groceries" },
    token
);

// Continue conversation
const response2 = await sendMessage(
    userId,
    {
        message: "Show me my tasks",
        conversation_id: response1.conversation_id
    },
    token
);
```

---

## Versioning

### Current Version: 1.0.0

### Breaking Changes Policy

Breaking changes will increment major version:
- Removing fields from response
- Changing field types
- Removing endpoints
- Changing authentication method

### Non-Breaking Changes

Non-breaking changes increment minor version:
- Adding optional fields to request
- Adding fields to response
- Adding new endpoints
- Performance improvements

### API Version Header

Future versions may use:
```
Accept: application/vnd.api+json; version=2.0
```

---

## Monitoring

### Metrics to Track

- Request rate (requests per minute)
- Response time (p50, p95, p99)
- Error rate (by status code)
- Tool invocation rate (by tool name)
- Conversation creation rate
- Database query time

### Logging

Log every request with:
- Timestamp
- user_id
- conversation_id
- Message length
- Tool calls
- Response time
- Status code

### Alerts

Alert on:
- Error rate > 5%
- Response time p95 > 3 seconds
- Database connection pool exhaustion
- OpenAI API errors
- Rate limit violations
