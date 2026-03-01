"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Input from "@/components/atoms/Input";
import PasswordInput from "@/components/atoms/PasswordInput";
import Button from "@/components/atoms/Button";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import LoadingSpinner from "@/components/molecules/LoadingSpinner";
import Toast from "@/components/molecules/Toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordMode, setPasswordMode] = useState<'choose' | 'generate' | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const popupRef = useRef<HTMLDivElement>(null);
  const passwordInputRef = useRef<HTMLDivElement>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        passwordInputRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !passwordInputRef.current.contains(event.target as Node)
      ) {
        setShowPasswordPopup(false);
      }
    };

    if (showPasswordPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPasswordPopup]);

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (user) {
    return null;
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const generateStrongPassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill remaining characters (total 16 chars)
    for (let i = password.length; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const getPasswordStrength = (pwd: string): { level: 'weak' | 'medium' | 'strong'; label: string; color: string } => {
    if (pwd.length === 0) {
      return { level: 'weak', label: '', color: 'gray' };
    }

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) {
      return { level: 'weak', label: 'Weak', color: 'red' };
    } else if (strength <= 4) {
      return { level: 'medium', label: 'Medium', color: 'yellow' };
    } else {
      return { level: 'strong', label: 'Strong', color: 'green' };
    }
  };

  const validatePassword = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd)
    );
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsDontMatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
  const passwordStrength = getPasswordStrength(password);

  const handlePasswordFocus = () => {
    if (!passwordMode) {
      setShowPasswordPopup(true);
    }
  };

  const handleUseStrongPassword = () => {
    const generatedPassword = generateStrongPassword();
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setPasswordMode('generate');
    setShowPasswordPopup(false);
    showToast('Strong password generated!', 'success');
  };

  const handleChooseOwnPassword = () => {
    setPasswordMode('choose');
    setShowPasswordPopup(false);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      showToast('Password copied to clipboard!', 'success');
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (err) {
      showToast('Failed to copy password', 'error');
    }
  };

  const validate = (): boolean => {
    const newErrors: {
      email?: string;
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (username.length > 50) {
      newErrors.username = 'Username must be 50 characters or less';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return (
      email.length > 0 &&
      username.length >= 3 &&
      validatePassword(password) &&
      password === confirmPassword &&
      confirmPassword.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password);
      showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed";
      setApiError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-110 transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 transition-colors duration-300">
            Create your account
          </h2>
          <p className="text-gray-600 transition-colors duration-300">
            Start organizing your tasks today
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-8 animate-slide-in-up transition-colors duration-300">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {apiError && (
              <div className="animate-shake">
                <ErrorMessage message={apiError} />
              </div>
            )}

            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                label="Email address"
                placeholder="you@example.com"
                error={errors.email}
                required
                autoComplete="username"
                disabled={loading}
              />

              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={setUsername}
                label="Username"
                placeholder="johndoe"
                error={errors.username}
                required
                autoComplete="off"
                disabled={loading}
                maxLength={50}
              />

              {/* Password Field with Popup */}
              <div className="relative" ref={passwordInputRef}>
                <PasswordInput
                  id="password"
                  name="password"
                  value={password}
                  onChange={setPassword}
                  onFocus={handlePasswordFocus}
                  label="Password"
                  placeholder="••••••••"
                  error={errors.password}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />

                {/* Password Popup */}
                {showPasswordPopup && !passwordMode && (
                  <div
                    ref={popupRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-fade-in"
                  >
                    <p className="text-sm font-medium text-gray-700 mb-3">Choose password option:</p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleUseStrongPassword}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 rounded-lg border border-violet-200 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-gray-900">Use Strong Password</p>
                          <p className="text-xs text-gray-600">Auto-generate secure password</p>
                        </div>
                        <svg className="w-5 h-5 text-violet-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={handleChooseOwnPassword}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-gray-900">Choose Your Own Password</p>
                          <p className="text-xs text-gray-600">Create a custom password</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.level === 'weak' ? 'text-red-600' :
                        passwordStrength.level === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.level === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength.level === 'medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                          {password.length >= 8 ? '✓' : '○'}
                        </span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                          {/[A-Z]/.test(password) ? '✓' : '○'}
                        </span>
                        <span>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                          {/[a-z]/.test(password) ? '✓' : '○'}
                        </span>
                        <span>One lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                          {/\d/.test(password) ? '✓' : '○'}
                        </span>
                        <span>One number</span>
                      </div>
                    </div>

                    {/* Copy Password Button (for generated passwords) */}
                    {passwordMode === 'generate' && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="w-full mt-2 px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium rounded-lg border border-violet-200 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {copiedPassword ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Password
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password with Match Indicator */}
              <div>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Confirm Password"
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordsMatch ? (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-600">Passwords match</span>
                      </>
                    ) : passwordsDontMatch ? (
                      <>
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-red-600">Passwords do not match</span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              disabled={loading || !isFormValid()}
              size="lg"
            >
              Create Account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <Link
              href="/signin"
              className="block w-full text-center px-4 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 hover:shadow-md"
            >
              Sign in instead
            </Link>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 animate-fade-in transition-colors duration-300">
          By signing up, you agree to our{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>

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
