import React from 'react';
import type { Task, TaskFilter } from '@/types';
import TaskCard from '@/components/molecules/TaskCard';
import EmptyState from '@/components/molecules/EmptyState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  onCreateTask?: () => void;
}

export default function TaskList({
  tasks,
  filter,
  onToggle,
  onEdit,
  onDelete,
  isLoading = false,
  onCreateTask,
}: TaskListProps) {
  if (isLoading && tasks.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState filter={filter} onCreateTask={onCreateTask} />;
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      role="list"
    >
      {tasks.map((task) => (
        <div key={task.id} role="listitem">
          <TaskCard
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
}
