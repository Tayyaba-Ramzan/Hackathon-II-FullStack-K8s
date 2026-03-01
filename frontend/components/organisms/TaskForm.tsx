import React, { useState, useEffect } from 'react';
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Button from '@/components/atoms/Button';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskCreateInput | TaskUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (description && description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Clear form after successful create (not edit)
      if (!initialData) {
        setTitle('');
        setDescription('');
        setErrors({});
      }
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="task-title"
        name="title"
        type="text"
        value={title}
        onChange={setTitle}
        label="Title"
        placeholder="Enter task title"
        error={errors.title}
        required
        maxLength={200}
        disabled={isLoading}
        autoComplete="off"
      />

      <Textarea
        id="task-description"
        name="description"
        value={description}
        onChange={setDescription}
        label="Description"
        placeholder="Enter task description (optional)"
        error={errors.description}
        rows={4}
        maxLength={2000}
        disabled={isLoading}
      />

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
