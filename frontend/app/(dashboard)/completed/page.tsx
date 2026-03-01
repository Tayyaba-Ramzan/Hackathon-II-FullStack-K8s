"use client";

import React, { useState } from 'react';
import { useTaskContext } from '@/lib/contexts/TaskContext';
import PremiumTaskCard from '@/components/molecules/PremiumTaskCard';
import TaskForm from '@/components/organisms/TaskForm';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import Toast from '@/components/molecules/Toast';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import type { Task, TaskUpdateInput } from '@/types';

export default function CompletedPage() {
  const {
    tasks,
    isLoading,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTaskContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const completedTasks = tasks.filter((t) => t.is_completed);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEditTask = async (data: TaskUpdateInput) => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await updateTask(selectedTask.id, data);
      setIsEditModalOpen(false);
      setSelectedTask(null);
      showToast('✅ Task updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update task. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await deleteTask(selectedTask.id);
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      showToast('🗑️ Task deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete task. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      await toggleTask(id);
    } catch (error) {
      showToast('Failed to update task status.', 'error');
    }
  };

  const openEditModal = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  const openDeleteDialog = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Completed Tasks</h1>
            <p className="text-gray-600 mt-1">
              {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'} completed
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 transition-colors duration-300">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-emerald-600">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Completed Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <SkeletonLoader type="list" count={6} />
        ) : completedTasks.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-12 border border-gray-200/50 shadow-lg text-center transition-colors duration-300">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed tasks yet</h3>
              <p className="text-gray-600 mb-6">
                Complete some tasks to see them here!
              </p>
            </div>
          ) : (
            completedTasks.map((task, index) => (
              <div key={task.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                <PremiumTaskCard
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                  isLoading={isLoading}
                />
              </div>
            ))
          )}
        </div>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
        size="md"
      >
        <TaskForm
          initialData={selectedTask || undefined}
          onSubmit={handleEditTask}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
