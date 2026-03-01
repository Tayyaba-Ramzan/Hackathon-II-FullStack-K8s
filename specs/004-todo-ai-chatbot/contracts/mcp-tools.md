# MCP Tools Contracts

**Purpose**: Define the interface for Model Context Protocol tools used by the AI agent to manage tasks

**Authentication**: All tools enforce user_id isolation - tools can only operate on tasks belonging to the authenticated user

---

## add_task

**Purpose**: Create a new task for the user

**Parameters**:
```json
{
  "user_id": "uuid (required)",
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 2000 chars)"
}
```

**Returns**:
```json
{
  "success": true,
  "task_id": "uuid",
  "message": "Task created successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Title cannot be empty"
}
```

**Validation**:
- user_id must be valid UUID
- title must not be empty
- title length must be 1-200 characters
- description length must be 0-2000 characters if provided

**Example**:
```json
Input: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "title": "Buy groceries", "description": "Milk, eggs, bread"}
Output: {"success": true, "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "message": "Task created successfully"}
```

---

## list_tasks

**Purpose**: Retrieve all tasks for the user

**Parameters**:
```json
{
  "user_id": "uuid (required)",
  "completed": "boolean (optional, default: null = all tasks)"
}
```

**Returns**:
```json
{
  "success": true,
  "tasks": [
    {
      "task_id": "uuid",
      "title": "string",
      "description": "string or null",
      "completed": false,
      "created_at": "ISO 8601 datetime",
      "updated_at": "ISO 8601 datetime"
    }
  ],
  "count": 2
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Invalid user_id format"
}
```

**Validation**:
- user_id must be valid UUID
- completed must be boolean if provided

**Filtering**:
- If completed=true, return only completed tasks
- If completed=false, return only incomplete tasks
- If completed=null (default), return all tasks

**Example**:
```json
Input: {"user_id": "550e8400-e29b-41d4-a716-446655440000"}
Output: {
  "success": true,
  "tasks": [
    {"task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "title": "Buy groceries", "description": "Milk, eggs, bread", "completed": false, "created_at": "2026-02-26T10:00:00Z", "updated_at": "2026-02-26T10:00:00Z"},
    {"task_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7", "title": "Call mom", "description": null, "completed": false, "created_at": "2026-02-26T09:00:00Z", "updated_at": "2026-02-26T09:00:00Z"}
  ],
  "count": 2
}
```

---

## complete_task

**Purpose**: Mark a task as completed

**Parameters**:
```json
{
  "user_id": "uuid (required)",
  "task_id": "uuid (required)"
}
```

**Returns**:
```json
{
  "success": true,
  "task_id": "uuid",
  "message": "Task marked as completed"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Task not found or does not belong to user"
}
```

**Validation**:
- user_id must be valid UUID
- task_id must be valid UUID
- task must exist and belong to user_id
- task must not already be completed

**Side Effects**:
- Sets completed = true
- Sets completed_at = current timestamp
- Updates updated_at = current timestamp

**Example**:
```json
Input: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"}
Output: {"success": true, "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "message": "Task marked as completed"}
```

---

## delete_task

**Purpose**: Permanently delete a task

**Parameters**:
```json
{
  "user_id": "uuid (required)",
  "task_id": "uuid (required)"
}
```

**Returns**:
```json
{
  "success": true,
  "task_id": "uuid",
  "message": "Task deleted successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Task not found or does not belong to user"
}
```

**Validation**:
- user_id must be valid UUID
- task_id must be valid UUID
- task must exist and belong to user_id

**Side Effects**:
- Permanently removes task from database
- Cannot be undone

**Example**:
```json
Input: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"}
Output: {"success": true, "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "message": "Task deleted successfully"}
```

---

## update_task

**Purpose**: Update task title and/or description

**Parameters**:
```json
{
  "user_id": "uuid (required)",
  "task_id": "uuid (required)",
  "title": "string (optional, 1-200 chars)",
  "description": "string (optional, max 2000 chars)"
}
```

**Returns**:
```json
{
  "success": true,
  "task_id": "uuid",
  "message": "Task updated successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Task not found or does not belong to user"
}
```

**Validation**:
- user_id must be valid UUID
- task_id must be valid UUID
- task must exist and belong to user_id
- At least one of title or description must be provided
- title length must be 1-200 characters if provided
- description length must be 0-2000 characters if provided

**Side Effects**:
- Updates specified fields only (partial update)
- Updates updated_at = current timestamp
- Does not affect completed status

**Example**:
```json
Input: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "title": "Buy groceries and cook dinner"}
Output: {"success": true, "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "message": "Task updated successfully"}
```

---

## Common Error Codes

| Error | Description | HTTP Equivalent |
|-------|-------------|-----------------|
| Invalid user_id format | user_id is not a valid UUID | 400 Bad Request |
| Invalid task_id format | task_id is not a valid UUID | 400 Bad Request |
| Title cannot be empty | title is empty or whitespace only | 400 Bad Request |
| Title too long | title exceeds 200 characters | 400 Bad Request |
| Description too long | description exceeds 2000 characters | 400 Bad Request |
| Task not found | task_id does not exist | 404 Not Found |
| Task does not belong to user | task exists but user_id mismatch | 403 Forbidden |
| Task already completed | Attempting to complete already completed task | 409 Conflict |
| No fields to update | update_task called with no title or description | 400 Bad Request |

## Security

**User Isolation**:
- All tools validate that task belongs to user_id before any operation
- Cross-user access is impossible at tool level
- Database queries always filtered by user_id

**Audit Logging**:
- All tool invocations logged with user_id, task_id, operation, timestamp
- Logs stored separately from application logs
- Log format: `[timestamp] [user_id] [tool_name] [parameters] [result]`

## Performance

**Expected Latency**:
- add_task: < 100ms
- list_tasks: < 200ms (for up to 1000 tasks)
- complete_task: < 100ms
- delete_task: < 100ms
- update_task: < 100ms

**Concurrency**:
- Tools are thread-safe
- Database connection pooling handles concurrent requests
- No locking required (user-scoped operations)
