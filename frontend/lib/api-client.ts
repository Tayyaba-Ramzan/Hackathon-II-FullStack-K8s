/**
 * API client with JWT token attachment and task operations
 */

import axios, { AxiosError } from "axios";
import type { Task, TaskCreateInput, TaskUpdateInput, APIError, APIErrorResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and redirect to signin
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // Only redirect if not already on auth pages
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/signin")) {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

// Parse API errors into a consistent format
export function parseAPIError(error: AxiosError<APIErrorResponse>): APIError {
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

// Task API operations
export const taskAPI = {
  // Get all tasks for the authenticated user
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks/');
    return response.data;
  },

  // Get a single task by ID
  async getTask(taskId: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  // Create a new task
  async createTask(data: TaskCreateInput): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks/', data);
    return response.data;
  },

  // Update an existing task
  async updateTask(taskId: number, data: TaskUpdateInput): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  // Delete a task
  async deleteTask(taskId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // Toggle task completion status
  async toggleTask(taskId: number, isCompleted: boolean): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, {
      is_completed: isCompleted,
    });
    return response.data;
  },
};

export default apiClient;
