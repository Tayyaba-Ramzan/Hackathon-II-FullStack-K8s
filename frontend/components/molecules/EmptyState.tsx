import React from 'react';
import type { TaskFilter } from '@/types';
import Button from '@/components/atoms/Button';

interface EmptyStateProps {
  filter: TaskFilter;
  onCreateTask?: () => void;
  className?: string;
}

export default function EmptyState({
  filter,
  onCreateTask,
  className = '',
}: EmptyStateProps) {
  const messages = {
    all: {
      title: 'No tasks yet',
      description: 'Get started by creating your first task!',
      emoji: '📝',
    },
    active: {
      title: 'All tasks completed!',
      description: 'Great job! You have no active tasks.',
      emoji: '🎉',
    },
    completed: {
      title: 'No completed tasks',
      description: 'Complete some tasks to see them here.',
      emoji: '✅',
    },
  };

  const message = messages[filter];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-4">{message.emoji}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message.title}
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message.description}
      </p>
      {onCreateTask && filter === 'all' && (
        <Button onClick={onCreateTask} variant="primary">
          Create Your First Task
        </Button>
      )}
    </div>
  );
}
