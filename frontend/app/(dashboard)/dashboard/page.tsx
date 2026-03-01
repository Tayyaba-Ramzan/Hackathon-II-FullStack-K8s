"use client";

import React, { useState } from 'react';
import { useTaskContext } from '@/lib/contexts/TaskContext';
import StatCard from '@/components/molecules/StatCard';
import PremiumTaskCard from '@/components/molecules/PremiumTaskCard';
import TaskForm from '@/components/organisms/TaskForm';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import Toast from '@/components/molecules/Toast';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types';

export default function DashboardPage() {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTaskContext();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.is_completed).length,
    completed: tasks.filter((t) => t.is_completed).length,
  };

  const completionRate = tasks.length > 0 ? Math.round((taskCounts.completed / tasks.length) * 100) : 0;
  const recentTasks = tasks.slice(0, 5);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleCreateTask = async (data: TaskCreateInput | TaskUpdateInput) => {
    setIsSubmitting(true);
    try {
      await createTask(data as TaskCreateInput);
      setIsCreateModalOpen(false);
      showToast('✨ Task created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create task. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (data: TaskCreateInput | TaskUpdateInput) => {
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your tasks and productivity</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </span>
          </button>
        </div>
      </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-in-up">
          {isLoading ? (
            <>
              <SkeletonLoader type="stat" count={4} />
            </>
          ) : (
            <>
              <StatCard
                title="Total Tasks"
                value={taskCounts.all}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                color="indigo"
              />
              <StatCard
                title="In Progress"
                value={taskCounts.active}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="amber"
              />
              <StatCard
                title="Completed"
                value={taskCounts.completed}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="emerald"
              />
              <StatCard
                title="Completion Rate"
                value={completionRate}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="violet"
              />
            </>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-lg transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h2>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonLoader type="list" count={5} />
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 mb-4">No tasks yet. Create your first task to get started!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Task
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task, index) => (
                <div key={task.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                  <PremiumTaskCard
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={openEditModal}
                    onDelete={openDeleteDialog}
                    isLoading={isLoading}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="md"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

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
