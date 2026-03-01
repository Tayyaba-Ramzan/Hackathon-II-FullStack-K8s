import React from 'react';
import Button from '@/components/atoms/Button';

export default function PremiumHero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full border border-indigo-200/50 shadow-lg shadow-indigo-500/10 mb-8 animate-fade-in transition-colors duration-300">
          <span className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-pulse" />
          <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Welcome to the future of task management
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in transition-colors duration-300" style={{ animationDelay: '0.1s' }}>
          Organize your work,
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            amplify your productivity
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in transition-colors duration-300" style={{ animationDelay: '0.2s' }}>
          TaskFlow helps teams and individuals stay organized with beautiful, intuitive task management.
          Built for modern workflows.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => window.location.href = '/signup'}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="relative z-10">Get Started Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-violet-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <button
            onClick={() => window.location.href = '/signin'}
            className="px-8 py-4 bg-white/80 backdrop-blur-lg text-gray-900 font-semibold rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            Sign In
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 transition-colors duration-300">Lightning Fast</h3>
            <p className="text-sm text-gray-600 transition-colors duration-300">Instant sync across all devices</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 transition-colors duration-300">Secure & Private</h3>
            <p className="text-sm text-gray-600 transition-colors duration-300">Your data is encrypted end-to-end</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 transition-colors duration-300">Team Collaboration</h3>
            <p className="text-sm text-gray-600 transition-colors duration-300">Work together seamlessly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
