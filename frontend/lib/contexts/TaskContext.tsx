"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import type { Task, TaskCreateInput, TaskUpdateInput, TaskFilter } from '@/types';

interface TaskContextValue {
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

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const taskState = useTasks();

  return (
    <TaskContext.Provider value={taskState}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
