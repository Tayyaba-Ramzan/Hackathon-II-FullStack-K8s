import React from 'react';
import type { TaskFilter } from '@/types';

interface TaskFilterProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

export default function TaskFilterComponent({
  currentFilter,
  onFilterChange,
  taskCounts,
}: TaskFilterProps) {
  const filters: { value: TaskFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex gap-2 border-b border-gray-200" role="tablist">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.value;
        const count = taskCounts[filter.value];

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${filter.value}-tasks`}
          >
            {filter.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isActive
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
