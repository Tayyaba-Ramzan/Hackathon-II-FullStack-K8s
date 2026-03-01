# MCP Tools Contract

**Feature**: 005-mcp-tools-agent
**Date**: 2026-02-26
**Version**: 1.0.0

## Overview

This document specifies the interface contract for the five MCP (Model Context Protocol) tools that provide task management operations. These tools are invoked by the AI agent to perform CRUD operations on tasks with strict user isolation.

## Tool Registry

All tools are registered in `backend/src/mcp/registry.py` and exposed to the OpenAI agent via function definitions.

## Common Patterns

### Authentication
- All tools require `user_id` parameter
- `user_id` is injected by the registry from authenticated session
- Tools MUST NOT accept user_id from agent (security)

### Response Format
All tools return a structured response:
```python
{
    "success": bool,      # Operation success status
    "message": str,       # Human-readable message
    "data": dict | None   # Operation-specific data
}
```

### Error Handling
- Invalid parameters → `success: false` with descriptive message
- Database errors → `success: false` with user-friendly message
- Not found errors → `success: false` with "not found" message
- Permission errors → `success: false` with "access denied" message

---

## Tool 1: add_task

### Purpose
Create a new task for the authenticated user.

### Function Signature
```python
async def add_task(
    user_id: UUID,
    title: str,
    description: str | None = None
) -> dict
```

### OpenAI Function Definition
```json
{
    "name": "add_task",
    "description": "Create a new task for the user with a title and optional description",
    "parameters": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "The task title (1-255 characters)",
                "minLength": 1,
                "maxLength": 255
            },
            "description": {
                "type": "string",
                "description": "Optional detailed description of the task (max 5000 characters)",
                "maxLength": 5000
            }
        },
        "required": ["title"]
    }
}
```

### Request Parameters
- `title` (string, required): Task title (1-255 characters)
- `description` (string, optional): Task description (max 5000 characters)

### Response
**Success**:
```json
{
    "success": true,
    "message": "Task created successfully",
    "data": {
        "task_id": "uuid-string",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": false,
        "created_at": "2026-02-26T10:30:00Z",
        "updated_at": "2026-02-26T10:30:00Z"
    }
}
```

**Failure**:
```json
{
    "success": false,
    "message": "Title cannot be empty",
    "data": null
}
```

### Validation Rules
- Title must not be empty
- Title max length: 255 characters
- Description max length: 5000 characters
- user_id must be valid UUID

### Example Usage
```python
result = await add_task(
    user_id=UUID("..."),
    title="Buy groceries",
    description="Milk, eggs, bread"
)
```

---

## Tool 2: list_tasks

### Purpose
Retrieve all tasks for the authenticated user, optionally filtered by completion status.

### Function Signature
```python
async def list_tasks(
    user_id: UUID,
    completed: bool | None = None
) -> dict
```

### OpenAI Function Definition
```json
{
    "name": "list_tasks",
    "description": "List all tasks for the user, optionally filtered by completion status",
    "parameters": {
        "type": "object",
        "properties": {
            "completed": {
                "type": "boolean",
                "description": "Filter by completion status. If omitted, returns all tasks."
            }
        },
        "required": []
    }
}
```

### Request Parameters
- `completed` (boolean, optional): Filter by completion status
  - `true`: Only completed tasks
  - `false`: Only incomplete tasks
  - `null`: All tasks

### Response
**Success**:
```json
{
    "success": true,
    "message": "Found 3 tasks",
    "data": {
        "tasks": [
            {
                "task_id": "uuid-1",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": false,
                "created_at": "2026-02-26T10:30:00Z",
                "updated_at": "2026-02-26T10:30:00Z"
            },
            {
                "task_id": "uuid-2",
                "title": "Call dentist",
                "description": null,
                "completed": false,
                "created_at": "2026-02-25T14:20:00Z",
                "updated_at": "2026-02-25T14:20:00Z"
            }
        ],
        "count": 2
    }
}
```

**Empty Result**:
```json
{
    "success": true,
    "message": "No tasks found",
    "data": {
        "tasks": [],
        "count": 0
    }
}
```

### Validation Rules
- user_id must be valid UUID
- completed must be boolean or null

### Example Usage
```python
# Get all tasks
result = await list_tasks(user_id=UUID("..."))

# Get only incomplete tasks
result = await list_tasks(user_id=UUID("..."), completed=False)
```

---

## Tool 3: complete_task

### Purpose
Mark a task as completed for the authenticated user.

### Function Signature
```python
async def complete_task(
    user_id: UUID,
    task_id: UUID
) -> dict
```

### OpenAI Function Definition
```json
{
    "name": "complete_task",
    "description": "Mark a task as completed",
    "parameters": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The UUID of the task to complete",
                "format": "uuid"
            }
        },
        "required": ["task_id"]
    }
}
```

### Request Parameters
- `task_id` (UUID, required): ID of the task to complete

### Response
**Success**:
```json
{
    "success": true,
    "message": "Task marked as completed",
    "data": {
        "task_id": "uuid-string",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": true,
        "created_at": "2026-02-26T10:30:00Z",
        "updated_at": "2026-02-26T11:45:00Z"
    }
}
```

**Failure (Not Found)**:
```json
{
    "success": false,
    "message": "Task not found or access denied",
    "data": null
}
```

### Validation Rules
- task_id must be valid UUID
- Task must exist and belong to user_id
- Task can be completed multiple times (idempotent)

### Security
- Tool verifies task belongs to user_id before updating
- Returns same error for "not found" and "access denied" (security)

### Example Usage
```python
result = await complete_task(
    user_id=UUID("..."),
    task_id=UUID("...")
)
```

---

## Tool 4: delete_task

### Purpose
Permanently delete a task for the authenticated user.

### Function Signature
```python
async def delete_task(
    user_id: UUID,
    task_id: UUID
) -> dict
```

### OpenAI Function Definition
```json
{
    "name": "delete_task",
    "description": "Permanently delete a task",
    "parameters": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The UUID of the task to delete",
                "format": "uuid"
            }
        },
        "required": ["task_id"]
    }
}
```

### Request Parameters
- `task_id` (UUID, required): ID of the task to delete

### Response
**Success**:
```json
{
    "success": true,
    "message": "Task deleted successfully",
    "data": {
        "task_id": "uuid-string",
        "deleted": true
    }
}
```

**Failure (Not Found)**:
```json
{
    "success": false,
    "message": "Task not found or access denied",
    "data": null
}
```

### Validation Rules
- task_id must be valid UUID
- Task must exist and belong to user_id
- Deletion is permanent (no soft delete)

### Security
- Tool verifies task belongs to user_id before deleting
- Returns same error for "not found" and "access denied" (security)

### Example Usage
```python
result = await delete_task(
    user_id=UUID("..."),
    task_id=UUID("...")
)
```

---

## Tool 5: update_task

### Purpose
Update a task's title and/or description for the authenticated user.

### Function Signature
```python
async def update_task(
    user_id: UUID,
    task_id: UUID,
    title: str | None = None,
    description: str | None = None
) -> dict
```

### OpenAI Function Definition
```json
{
    "name": "update_task",
    "description": "Update a task's title and/or description",
    "parameters": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The UUID of the task to update",
                "format": "uuid"
            },
            "title": {
                "type": "string",
                "description": "New task title (1-255 characters)",
                "minLength": 1,
                "maxLength": 255
            },
            "description": {
                "type": "string",
                "description": "New task description (max 5000 characters)",
                "maxLength": 5000
            }
        },
        "required": ["task_id"]
    }
}
```

### Request Parameters
- `task_id` (UUID, required): ID of the task to update
- `title` (string, optional): New title (1-255 characters)
- `description` (string, optional): New description (max 5000 characters)

### Response
**Success**:
```json
{
    "success": true,
    "message": "Task updated successfully",
    "data": {
        "task_id": "uuid-string",
        "title": "Buy groceries and supplies",
        "description": "Milk, eggs, bread, paper towels",
        "completed": false,
        "created_at": "2026-02-26T10:30:00Z",
        "updated_at": "2026-02-26T12:15:00Z"
    }
}
```

**Failure (Not Found)**:
```json
{
    "success": false,
    "message": "Task not found or access denied",
    "data": null
}
```

**Failure (Validation)**:
```json
{
    "success": false,
    "message": "At least one field (title or description) must be provided",
    "data": null
}
```

### Validation Rules
- task_id must be valid UUID
- At least one of title or description must be provided
- Title max length: 255 characters (if provided)
- Description max length: 5000 characters (if provided)
- Task must exist and belong to user_id

### Security
- Tool verifies task belongs to user_id before updating
- Returns same error for "not found" and "access denied" (security)

### Example Usage
```python
# Update title only
result = await update_task(
    user_id=UUID("..."),
    task_id=UUID("..."),
    title="Buy groceries and supplies"
)

# Update description only
result = await update_task(
    user_id=UUID("..."),
    task_id=UUID("..."),
    description="Milk, eggs, bread, paper towels"
)

# Update both
result = await update_task(
    user_id=UUID("..."),
    task_id=UUID("..."),
    title="Buy groceries and supplies",
    description="Milk, eggs, bread, paper towels"
)
```

---

## Tool Registry Implementation

### Registry Functions

**get_tool_definitions() → list[dict]**
Returns OpenAI function definitions for all tools.

**execute_tool(tool_name: str, params: dict, session: AsyncSession) → dict**
Executes the specified tool with given parameters.

### Security Enforcement

The registry:
1. Validates tool_name is registered
2. Injects user_id from authenticated session
3. Validates parameters against tool schema
4. Executes tool with database session
5. Returns structured response

### Error Handling

Registry catches and formats:
- Invalid tool names
- Parameter validation errors
- Database connection errors
- Tool execution exceptions

---

## Testing Requirements

### Unit Tests

Each tool must have unit tests covering:
- ✅ Successful operation
- ✅ Invalid parameters
- ✅ Not found scenarios
- ✅ User isolation (cannot access other user's tasks)
- ✅ Edge cases (empty strings, max lengths, etc.)

### Integration Tests

- ✅ Tool execution via registry
- ✅ Database transactions
- ✅ Concurrent tool calls
- ✅ Error propagation

### Contract Tests

- ✅ OpenAI function definitions match tool signatures
- ✅ Response format consistency
- ✅ Parameter validation matches schema

---

## Performance Requirements

- Tool execution: <500ms (including database operation)
- Concurrent tool calls: Support 100+ simultaneous executions
- Database connection pooling: Reuse connections efficiently
- Query optimization: Use indexes for user_id filtering

---

## Audit Trail

All tool invocations should be logged with:
- Timestamp
- user_id
- tool_name
- Parameters (sanitized)
- Result (success/failure)
- Execution time

This enables debugging and security auditing.
