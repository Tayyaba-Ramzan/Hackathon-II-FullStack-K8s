"use client";

import { useState, useCallback, useEffect } from 'react';
import { taskAPI, parseAPIError } from '@/lib/api-client';
import type { Task, TaskCreateInput, TaskUpdateInput, TaskFilter, APIErrorResponse } from '@/types';
import { AxiosError } from 'axios';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
  filteredTasks: Task[];
  fetchTasks: () => Promise<void>;
  createTask: (data: TaskCreateInput) => Promise<Task>;
  updateTask: (id: number, data: TaskUpdateInput) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<Task>;
  setFilter: (filter: TaskFilter) => void;
  clearError: () => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true; // 'all'
  });

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskAPI.getTasks();
      setTasks(data);
    } catch (err) {
      const apiError = parseAPIError(err as AxiosError<APIErrorResponse>);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const createTask = useCallback(async (data: TaskCreateInput): Promise<Task> => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await taskAPI.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      const apiError = parseAPIError(err as AxiosError<APIErrorResponse>);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id: number, data: TaskUpdateInput): Promise<Task> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskAPI.updateTask(id, data);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      const apiError = parseAPIError(err as AxiosError<APIErrorResponse>);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await taskAPI.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      const apiError = parseAPIError(err as AxiosError<APIErrorResponse>);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle task completion (optimistic update)
  const toggleTask = useCallback(async (id: number): Promise<Task> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');

    // Optimistic update
    const optimisticTask = { ...task, is_completed: !task.is_completed };
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? optimisticTask : t))
    );

    try {
      const updatedTask = await taskAPI.toggleTask(id, !task.is_completed);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
      return updatedTask;
    } catch (err) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? task : t))
      );
      const apiError = parseAPIError(err as AxiosError<APIErrorResponse>);
      setError(apiError.message);
      throw err;
    }
  }, [tasks]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    isLoading,
    error,
    filter,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilter,
    clearError,
  };
}
