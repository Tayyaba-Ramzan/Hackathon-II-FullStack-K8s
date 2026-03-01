# API Client Contract

**Feature**: 003-frontend-ui
**Created**: 2026-02-23
**Status**: Draft

## Overview

This document defines the API client interface for communicating with the backend API (Spec 001 & 002). The client handles authentication, request/response formatting, error handling, and token management.

## Base Configuration

### API Client Setup

```typescript
// src/lib/api-client.ts

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For httpOnly cookies
});
```

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:8001)

**Configuration**:
- Timeout: 10 seconds
- Credentials: Included for cookie-based auth
- Base headers: JSON content type

---

## Request Interceptor

### JWT Token Injection

```typescript
apiClient.interceptors.request.use(
  (config) => {
    // Better Auth handles token via httpOnly cookies
    // No manual token injection needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Behavior**:
- Better Auth manages JWT tokens via httpOnly cookies
- Cookies automatically included with `withCredentials: true`
- No manual Authorization header needed

---

## Response Interceptor

### Error Handling

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIErrorResponse>) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/signin';
      }

      if (status === 403) {
        // Forbidden - show error
        console.error('Access forbidden:', data);
      }

      if (status >= 500) {
        // Server error
        console.error('Server error:', data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.message);
    } else {
      // Request setup error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);
```

**Error Types**:
- **401 Unauthorized**: Redirect to login page
- **403 Forbidden**: Access denied (show error message)
- **422 Validation Error**: Field-level validation errors
- **500+ Server Error**: Backend error (show generic error)
- **Network Error**: No response from server

---

## API Error Response Types

```typescript
interface APIErrorResponse {
  detail: string | ValidationError[];
}

interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

interface APIError {
  message: string;
  status: number;
  field?: string;
}
```

**Error Parsing**:
```typescript
function parseAPIError(error: AxiosError<APIErrorResponse>): APIError {
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  }

  const { status, data } = error.response;

  if (Array.isArray(data.detail)) {
    // Validation errors
    const firstError = data.detail[0];
    return {
      message: firstError.msg,
      status,
      field: firstError.loc[firstError.loc.length - 1],
    };
  }

  return {
    message: typeof data.detail === 'string' ? data.detail : 'An error occurred',
    status,
  };
}
```

---

## Authentication API

### Register

**Endpoint**: `POST /auth/register`

**Request**:
```typescript
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}
```

**Response**:
```typescript
interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}
```

**Client Method**:
```typescript
async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
}
```

**Error Responses**:
- `400`: Email already registered
- `422`: Validation error (invalid email, weak password, etc.)

---

### Login

**Endpoint**: `POST /auth/login`

**Request**:
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response**:
```typescript
interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
```

**Client Method**:
```typescript
async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
}
```

**Error Responses**:
- `401`: Invalid credentials
- `422`: Validation error

---

### Get Current User

**Endpoint**: `GET /auth/me`

**Request**: None (uses JWT from cookie)

**Response**:
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}
```

**Client Method**:
```typescript
async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}
```

**Error Responses**:
- `401`: Not authenticated

---

### Logout

**Endpoint**: `POST /auth/logout`

**Request**: None

**Response**: `204 No Content`

**Client Method**:
```typescript
async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
```

---

## Tasks API

### Get All Tasks

**Endpoint**: `GET /tasks/`

**Request**: None (uses JWT from cookie)

**Response**:
```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

type GetTasksResponse = Task[];
```

**Client Method**:
```typescript
async function getTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>('/tasks/');
  return response.data;
}
```

**Error Responses**:
- `401`: Not authenticated

---

### Get Single Task

**Endpoint**: `GET /tasks/{task_id}`

**Request**: None (uses JWT from cookie)

**Response**:
```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}
```

**Client Method**:
```typescript
async function getTask(taskId: number): Promise<Task> {
  const response = await apiClient.get<Task>(`/tasks/${taskId}`);
  return response.data;
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Task belongs to another user
- `404`: Task not found

---

### Create Task

**Endpoint**: `POST /tasks/`

**Request**:
```typescript
interface CreateTaskRequest {
  title: string;
  description?: string;
}
```

**Response**:
```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}
```

**Client Method**:
```typescript
async function createTask(data: CreateTaskRequest): Promise<Task> {
  const response = await apiClient.post<Task>('/tasks/', data);
  return response.data;
}
```

**Error Responses**:
- `401`: Not authenticated
- `422`: Validation error (title too long, etc.)

---

### Update Task

**Endpoint**: `PUT /tasks/{task_id}`

**Request**:
```typescript
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  is_completed?: boolean;
}
```

**Response**:
```typescript
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}
```

**Client Method**:
```typescript
async function updateTask(taskId: number, data: UpdateTaskRequest): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
  return response.data;
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Task belongs to another user
- `404`: Task not found
- `422`: Validation error

---

### Delete Task

**Endpoint**: `DELETE /tasks/{task_id}`

**Request**: None (uses JWT from cookie)

**Response**: `204 No Content`

**Client Method**:
```typescript
async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}
```

**Error Responses**:
- `401`: Not authenticated
- `403`: Task belongs to another user
- `404`: Task not found

---

## Exported API Client

```typescript
// src/lib/api.ts

export const api = {
  auth: {
    register,
    login,
    logout,
    getCurrentUser,
  },
  tasks: {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
  },
};

export { parseAPIError };
export type { APIError, User, Task, CreateTaskRequest, UpdateTaskRequest };
```

**Usage Example**:
```typescript
import { api, parseAPIError } from '@/lib/api';

try {
  const tasks = await api.tasks.getTasks();
  console.log('Tasks:', tasks);
} catch (error) {
  const apiError = parseAPIError(error as AxiosError);
  console.error('Error:', apiError.message);
}
```

---

## Retry Logic

### Automatic Retry for Network Errors

```typescript
import axiosRetry from 'axios-retry';

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status ?? 0) >= 500;
  },
});
```

**Retry Strategy**:
- Max retries: 3
- Delay: Exponential backoff (1s, 2s, 4s)
- Conditions: Network errors or 5xx server errors
- No retry for 4xx client errors

---

## Request/Response Logging (Development Only)

```typescript
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log(`[API] ${response.status} ${response.config.url}`, response.data);
      return response;
    },
    (error) => {
      console.error(`[API] Error ${error.config?.url}`, error.response?.data);
      return Promise.reject(error);
    }
  );
}
```

---

## Type Safety

All API methods are fully typed with TypeScript:
- Request payloads validated at compile time
- Response data typed for autocomplete
- Error responses typed for proper handling

---

## Testing Requirements

### Unit Tests

1. **Request Interceptor**:
   - Includes credentials
   - Sets correct headers

2. **Response Interceptor**:
   - Handles 401 (redirects to login)
   - Handles 403 (logs error)
   - Handles 500+ (logs error)
   - Handles network errors

3. **API Methods**:
   - Calls correct endpoint
   - Sends correct payload
   - Returns correct response type
   - Handles errors properly

### Integration Tests

1. **Authentication Flow**:
   - Register → Login → Get User → Logout
   - Invalid credentials handled
   - Token refresh works

2. **Task Operations**:
   - Create → Read → Update → Delete
   - User isolation enforced
   - Validation errors handled

---

## Security Considerations

1. **Token Storage**: JWT stored in httpOnly cookie (managed by Better Auth)
2. **CSRF Protection**: Cookies with SameSite=Lax
3. **XSS Prevention**: No token in localStorage/sessionStorage
4. **HTTPS Only**: Production must use HTTPS
5. **Timeout**: 10-second timeout prevents hanging requests
6. **Error Messages**: No sensitive data in error messages

---

## Performance Optimizations

1. **Request Deduplication**: Prevent duplicate simultaneous requests
2. **Response Caching**: Cache GET requests (optional, not in MVP)
3. **Request Cancellation**: Cancel pending requests on component unmount
4. **Compression**: Accept gzip/brotli encoding

---

## Environment Configuration

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001

# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Note**: `NEXT_PUBLIC_` prefix required for client-side access in Next.js
