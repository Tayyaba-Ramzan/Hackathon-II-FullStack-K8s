# Data Model: Frontend Application

**Feature**: 003-frontend-ui
**Created**: 2026-02-23
**Status**: Draft

## Overview

This document defines the data structures, state management patterns, and component data models for the frontend application. The frontend consumes the backend API (Spec 001 & 002) and manages UI state locally.

## State Architecture

### Global State (React Context)

#### AuthContext
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

**Purpose**: Manages authentication state across the application
**Persistence**: JWT token stored in httpOnly cookie (handled by Better Auth)
**Scope**: Application-wide

#### TaskContext
```typescript
interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
}

interface TaskContextValue extends TaskState {
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskCreateInput) => Promise<Task>;
  updateTask: (id: number, data: TaskUpdateInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<Task>;
  setFilter: (filter: TaskFilter) => void;
  clearError: () => void;
}

type TaskFilter = 'all' | 'active' | 'completed';
```

**Purpose**: Manages task data and operations
**Persistence**: None (fetched from API on mount)
**Scope**: Dashboard and task-related pages

### Local Component State

#### Form State
```typescript
interface TaskFormState {
  title: string;
  description: string;
  errors: {
    title?: string;
    description?: string;
  };
  isSubmitting: boolean;
}
```

**Purpose**: Manages form input and validation
**Scope**: TaskForm component

#### UI State
```typescript
interface UIState {
  isModalOpen: boolean;
  selectedTaskId: number | null;
  showDeleteConfirm: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null;
}
```

**Purpose**: Manages transient UI state
**Scope**: Individual components

## Data Entities

### User (from Backend API)
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  created_at: string; // ISO 8601
}
```

**Source**: Backend API `/auth/me`
**Validation**: Email format, username 3-50 chars
**Relationships**: One-to-many with Task

### Task (from Backend API)
```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

**Source**: Backend API `/tasks/`
**Validation**: Title 1-200 chars, description max 2000 chars
**Relationships**: Many-to-one with User

### Task Input Types
```typescript
interface TaskCreateInput {
  title: string;
  description?: string;
}

interface TaskUpdateInput {
  title?: string;
  description?: string;
  is_completed?: boolean;
}
```

**Purpose**: Type-safe input for task operations
**Validation**: Client-side validation before API call

## Component Data Models

### TaskCard Props
```typescript
interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}
```

### TaskList Props
```typescript
interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

### TaskForm Props
```typescript
interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskCreateInput | TaskUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### AuthForm Props
```typescript
interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface AuthFormData {
  email: string;
  password: string;
  username?: string; // Only for register mode
}
```

## State Transitions

### Authentication Flow
```
Initial State: { user: null, token: null, isAuthenticated: false, isLoading: false }

Login/Register:
  → isLoading: true
  → API call
  → Success: { user: User, token: string, isAuthenticated: true, isLoading: false }
  → Error: { error: string, isLoading: false }

Logout:
  → { user: null, token: null, isAuthenticated: false, isLoading: false }
```

### Task Operations Flow
```
Initial State: { tasks: [], isLoading: false, error: null }

Fetch Tasks:
  → isLoading: true
  → API call
  → Success: { tasks: Task[], isLoading: false }
  → Error: { error: string, isLoading: false }

Create Task:
  → isLoading: true
  → API call
  → Success: { tasks: [...tasks, newTask], isLoading: false }
  → Error: { error: string, isLoading: false }

Update Task:
  → isLoading: true
  → API call
  → Success: { tasks: tasks.map(t => t.id === id ? updated : t), isLoading: false }
  → Error: { error: string, isLoading: false }

Delete Task:
  → isLoading: true
  → API call
  → Success: { tasks: tasks.filter(t => t.id !== id), isLoading: false }
  → Error: { error: string, isLoading: false }

Toggle Task:
  → isLoading: true
  → API call
  → Success: { tasks: tasks.map(t => t.id === id ? {...t, is_completed: !t.is_completed} : t), isLoading: false }
  → Error: { error: string, isLoading: false }
```

## Data Validation Rules

### Client-Side Validation

**Task Title**:
- Required: Yes
- Min length: 1 character
- Max length: 200 characters
- Pattern: Any non-empty string

**Task Description**:
- Required: No
- Max length: 2000 characters

**Email**:
- Required: Yes
- Pattern: Valid email format (RFC 5322)
- Example: `user@example.com`

**Password**:
- Required: Yes
- Min length: 8 characters
- Pattern: At least one uppercase, one lowercase, one number

**Username**:
- Required: Yes (register only)
- Min length: 3 characters
- Max length: 50 characters
- Pattern: Alphanumeric and underscores only

## Error Handling

### API Error Response
```typescript
interface APIError {
  detail: string | { msg: string; type: string }[];
  status: number;
}
```

### Error State Management
```typescript
interface ErrorState {
  message: string;
  code?: string;
  field?: string; // For field-specific errors
}
```

**Error Display Strategy**:
- Form validation errors: Inline below field
- API errors: Toast notification
- Network errors: Banner at top of page
- Authentication errors: Redirect to login with message

## Performance Considerations

### Data Caching
- Tasks: Cached in TaskContext, refetch on mount
- User: Cached in AuthContext, persists across page navigation
- No local storage caching (rely on API for source of truth)

### Optimistic Updates
- Toggle task completion: Update UI immediately, rollback on error
- Delete task: Remove from UI immediately, rollback on error
- Create/Update task: Wait for API response before updating UI

### Pagination (Future Enhancement)
```typescript
interface PaginatedTaskState {
  tasks: Task[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}
```

**Note**: Not implemented in MVP, but structure supports future pagination

## Assumptions

1. **JWT Token Management**: Better Auth handles token storage and refresh automatically
2. **Single User Session**: No concurrent sessions or multi-device sync
3. **Network Reliability**: Basic retry logic for failed requests (3 attempts)
4. **Data Freshness**: Tasks refetched on dashboard mount, no real-time updates
5. **Browser Support**: Modern browsers with ES6+ support (Chrome 90+, Firefox 88+, Safari 14+)
