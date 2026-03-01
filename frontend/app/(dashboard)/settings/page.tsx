"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Toast from '@/components/molecules/Toast';
import ConfirmationModal from '@/components/molecules/ConfirmationModal';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import apiClient from '@/lib/api-client';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({});

  // Load user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setIsLoading(false);
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const validateProfile = (): boolean => {
    const newErrors: { username?: string; email?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await apiClient.put('/users/me/profile', {
        username: username !== user?.username ? username : undefined,
        email: email !== user?.email ? email : undefined,
      });

      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data));

      showToast('✅ Profile updated successfully!', 'success');
      setIsEditingProfile(false);

      // Reload page to update user context
      window.location.reload();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update profile';
      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };


  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      await apiClient.delete('/users/me/account');

      showToast('✅ Account deleted successfully', 'success');

      // Logout and redirect to landing page
      setTimeout(() => {
        logout();
        router.push('/');
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete account';
      showToast(`❌ ${errorMessage}`, 'error');
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Account Information */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-lg animate-slide-in-up transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h2>
            {!isEditingProfile && !isLoading && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonLoader type="text" count={3} />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                    isEditingProfile
                      ? 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 cursor-not-allowed'
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                    isEditingProfile
                      ? 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 cursor-not-allowed'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <input
                  type="text"
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 cursor-not-allowed"
                />
              </div>

              {isEditingProfile && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setUsername(user?.username || '');
                      setEmail(user?.email || '');
                      setErrors({});
                    }}
                    disabled={isSavingProfile}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danger Zone */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-red-200/50 shadow-lg animate-slide-in-up transition-colors duration-300" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 transition-colors duration-300">
                <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. All your tasks and data will be permanently deleted.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-600/40"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account?"
          message="This action cannot be undone. All your tasks and data will be permanently deleted."
          confirmText="Delete Account"
          cancelText="Cancel"
          isDanger={true}
          isLoading={isDeletingAccount}
        />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
