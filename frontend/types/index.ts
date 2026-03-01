// User types (from auth)
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

// Task types
export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  is_completed?: boolean;
}

// Filter types
export type TaskFilter = 'all' | 'active' | 'completed';

// API Error types
export interface APIErrorResponse {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

export interface APIError {
  message: string;
  status: number;
  field?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
