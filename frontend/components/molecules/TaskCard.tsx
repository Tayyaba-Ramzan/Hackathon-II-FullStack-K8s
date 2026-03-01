import React from 'react';
import type { Task } from '@/types';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  isLoading = false,
}: TaskCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            id={`task-${task.id}`}
            name={`task-${task.id}`}
            checked={task.is_completed}
            onChange={() => onToggle(task.id)}
            disabled={isLoading}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium text-gray-900 mb-1 transition-all duration-200 ${
              task.is_completed ? 'line-through opacity-60' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-sm text-gray-600 mb-3 transition-opacity duration-200 ${
                task.is_completed ? 'opacity-60' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span>Created {formatDate(task.created_at)}</span>
              {task.updated_at !== task.created_at && (
                <span className="ml-2">• Updated {formatDate(task.updated_at)}</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task.id)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                disabled={isLoading}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
