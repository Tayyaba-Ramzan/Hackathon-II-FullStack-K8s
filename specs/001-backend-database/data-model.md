# Data Model: Backend & Database – High-Level Todo App

**Feature**: 001-backend-database
**Date**: 2026-02-23
**Purpose**: Define database entities, relationships, validation rules, and state transitions

## Entity Definitions

### User Entity

**Purpose**: Represents a user account in the system

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| email | String | Required, Unique, Max 255 chars | User's email address |
| username | String | Required, Unique, Max 50 chars | User's display name |
| created_at | DateTime | Auto-generated, Not Null | Account creation timestamp |

**Validation Rules**:
- `email`: Must be valid email format (validated by Pydantic EmailStr)
- `username`: Must be 3-50 characters, alphanumeric with underscores allowed
- `email` and `username`: Must be unique across all users

**Indexes**:
- Primary: `id` (auto-indexed)
- Unique: `email` (for fast lookup and uniqueness enforcement)
- Unique: `username` (for fast lookup and uniqueness enforcement)

**Relationships**:
- One-to-Many with Task: One user can have many tasks

**SQLModel Definition**:
```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(unique=True, index=True, max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="user")
```

---

### Task Entity

**Purpose**: Represents a todo item belonging to a user

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| title | String | Required, Max 200 chars | Task title/summary |
| description | String | Optional, Max 2000 chars | Detailed task description |
| is_completed | Boolean | Required, Default False | Completion status |
| user_id | Integer | Foreign Key (User.id), Required | Owner of the task |
| created_at | DateTime | Auto-generated, Not Null | Task creation timestamp |
| updated_at | DateTime | Auto-updated, Not Null | Last modification timestamp |

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `is_completed`: Boolean, defaults to False
- `user_id`: Must reference an existing user (foreign key constraint)

**Indexes**:
- Primary: `id` (auto-indexed)
- Foreign Key: `user_id` (indexed for fast filtering by user)

**Relationships**:
- Many-to-One with User: Each task belongs to exactly one user

**SQLModel Definition**:
```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: User = Relationship(back_populates="tasks")
```

## Entity Relationships

### User ↔ Task (One-to-Many)

**Relationship Type**: One-to-Many

**Description**: One user can have multiple tasks, but each task belongs to exactly one user.

**Foreign Key**: `task.user_id` → `user.id`

**Cascade Behavior**:
- **On Delete User**: Cascade delete all associated tasks (or prevent deletion if tasks exist - to be decided during implementation)
- **On Update User.id**: Cascade update (though primary keys typically don't change)

**Referential Integrity**: Enforced at database level via foreign key constraint

**Query Patterns**:
- Get all tasks for a user: `SELECT * FROM task WHERE user_id = ?`
- Get user for a task: `SELECT * FROM user WHERE id = (SELECT user_id FROM task WHERE id = ?)`

**ERD Representation**:
```
┌──────────────┐         ┌──────────────┐
│     User     │         │     Task     │
├──────────────┤         ├──────────────┤
│ id (PK)      │────────<│ id (PK)      │
│ email        │    1:N  │ title        │
│ username     │         │ description  │
│ created_at   │         │ is_completed │
└──────────────┘         │ user_id (FK) │
                         │ created_at   │
                         │ updated_at   │
                         └──────────────┘
```

## State Transitions

### Task Completion State

**States**:
- `is_completed = False` (Incomplete/Active)
- `is_completed = True` (Completed)

**Transitions**:

```
┌─────────────┐  Create Task   ┌─────────────┐
│   (None)    │───────────────>│ Incomplete  │
└─────────────┘                └─────────────┘
                                      │
                                      │ Toggle/Update
                                      ↓
                                ┌─────────────┐
                                │  Completed  │
                                └─────────────┘
                                      │
                                      │ Toggle/Update
                                      ↓
                                ┌─────────────┐
                                │ Incomplete  │
                                └─────────────┘
```

**Allowed Operations**:
- **Create**: Always creates task with `is_completed = False`
- **Toggle**: Flips `is_completed` between True and False
- **Update**: Can explicitly set `is_completed` to any boolean value
- **Delete**: Can delete task in any state

**Business Rules**:
- No restrictions on state transitions (can toggle freely)
- `updated_at` timestamp updated on any state change
- No audit trail of state changes (out of scope)

## Validation Rules Summary

### User Validation

**Create User**:
- ✅ Email required and valid format
- ✅ Username required, 3-50 chars, alphanumeric + underscores
- ✅ Email must be unique
- ✅ Username must be unique

**Read User**:
- ✅ User ID must exist (404 if not found)

### Task Validation

**Create Task**:
- ✅ Title required, 1-200 chars
- ✅ Description optional, max 2000 chars
- ✅ User ID required and must reference existing user (400 if user not found)
- ✅ is_completed defaults to False if not provided

**Read Task**:
- ✅ Task ID must exist (404 if not found)

**Update Task**:
- ✅ Task ID must exist (404 if not found)
- ✅ Title optional in update, but if provided must be 1-200 chars
- ✅ Description optional, max 2000 chars if provided
- ✅ is_completed optional, must be boolean if provided
- ✅ User ID cannot be changed (not allowed in update)

**Delete Task**:
- ✅ Task ID must exist (404 if not found)

**Toggle Task**:
- ✅ Task ID must exist (404 if not found)
- ✅ No request body required
- ✅ Flips is_completed to opposite value

## Database Schema SQL

### Table Creation (PostgreSQL)

```sql
-- Users table
CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_username ON user(username);
```

### Trigger for updated_at (PostgreSQL)

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on task table
CREATE TRIGGER update_task_updated_at
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Note**: SQLModel/SQLAlchemy can handle `updated_at` updates in application code, so the trigger is optional.

## Data Integrity Constraints

### Referential Integrity

- **Foreign Key**: `task.user_id` → `user.id`
- **Enforcement**: Database-level constraint
- **Behavior**: Prevent orphaned tasks (tasks without valid user)

### Uniqueness Constraints

- **user.email**: Unique across all users
- **user.username**: Unique across all users
- **Enforcement**: Database-level unique constraints

### Not Null Constraints

- **user.email**: Cannot be null
- **user.username**: Cannot be null
- **task.title**: Cannot be null
- **task.is_completed**: Cannot be null (has default)
- **task.user_id**: Cannot be null
- **All timestamps**: Cannot be null (have defaults)

## Query Optimization

### Common Queries

1. **Get all tasks for a user**:
   ```sql
   SELECT * FROM task WHERE user_id = ? ORDER BY created_at DESC;
   ```
   - Optimized by: `idx_task_user_id` index

2. **Get user by email** (for future auth):
   ```sql
   SELECT * FROM user WHERE email = ?;
   ```
   - Optimized by: `idx_user_email` unique index

3. **Get task by ID**:
   ```sql
   SELECT * FROM task WHERE id = ?;
   ```
   - Optimized by: Primary key index

4. **Count tasks by user**:
   ```sql
   SELECT COUNT(*) FROM task WHERE user_id = ?;
   ```
   - Optimized by: `idx_task_user_id` index

### Performance Considerations

- All foreign key columns are indexed
- Unique constraints automatically create indexes
- Primary keys automatically indexed
- No full table scans expected for common operations
- Satisfies SC-004 (efficient queries with proper indexing)

## Migration Strategy

**Initial Setup**: Create tables using SQLModel's `SQLModel.metadata.create_all(engine)`

**Future Migrations**: Consider using Alembic for schema versioning when schema changes are needed

**Development**: Drop and recreate tables for clean state

**Production**: Use proper migration tool (Alembic) to preserve data

## Summary

The data model consists of two entities (User and Task) with a clear one-to-many relationship. All validation rules are defined and will be enforced at both the application layer (Pydantic) and database layer (constraints). The schema is normalized, indexed for performance, and supports all functional requirements from the specification.

**Next**: Generate API contracts in contracts/ directory
