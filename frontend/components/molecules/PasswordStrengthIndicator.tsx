"use client";

import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
  };
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pwd: string): StrengthResult => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
    };

    const score = Object.values(checks).filter(Boolean).length;

    if (score === 0 || pwd.length === 0) {
      return {
        score: 0,
        label: '',
        color: 'bg-gray-200',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        checks,
      };
    }

    if (score <= 1) {
      return {
        score: 25,
        label: 'Weak',
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        checks,
      };
    }

    if (score === 2) {
      return {
        score: 50,
        label: 'Fair',
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        checks,
      };
    }

    if (score === 3) {
      return {
        score: 75,
        label: 'Good',
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        checks,
      };
    }

    return {
      score: 100,
      label: 'Strong',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      checks,
    };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3 animate-fade-in">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          {strength.label && (
            <span className={`text-xs font-semibold ${strength.textColor}`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-500 ease-out`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className={`p-3 rounded-lg ${strength.bgColor} border border-gray-200/50 transition-colors duration-300`}>
        <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2 text-xs">
            {strength.checks.length ? (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={strength.checks.length ? 'text-green-700 font-medium' : 'text-gray-600'}>
              At least 8 characters
            </span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            {strength.checks.uppercase ? (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={strength.checks.uppercase ? 'text-green-700 font-medium' : 'text-gray-600'}>
              One uppercase letter (A-Z)
            </span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            {strength.checks.lowercase ? (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={strength.checks.lowercase ? 'text-green-700 font-medium' : 'text-gray-600'}>
              One lowercase letter (a-z)
            </span>
          </li>
          <li className="flex items-center gap-2 text-xs">
            {strength.checks.number ? (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={strength.checks.number ? 'text-green-700 font-medium' : 'text-gray-600'}>
              One number (0-9)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
