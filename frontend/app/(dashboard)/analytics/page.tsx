"use client";

import React from 'react';

export default function AnalyticsPage() {
  return (
    <>
      {/* Coming Soon Banner */}
      <div className="bg-white rounded-2xl p-12 border border-violet-200/50 shadow-lg text-center animate-fade-in transition-colors duration-300">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4 transition-colors duration-300">
              Analytics Dashboard
            </h1>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-6 transition-colors duration-300">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-violet-600">Coming Soon</span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 transition-colors duration-300">
              We're working on powerful analytics features to help you track your productivity, visualize task completion trends, and gain insights into your work patterns.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-gray-200/50 transition-colors duration-300">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 transition-colors duration-300">Task Completion Trends</h3>
                  <p className="text-sm text-gray-600 transition-colors duration-300">Track your productivity over time with interactive charts</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-gray-200/50 transition-colors duration-300">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 transition-colors duration-300">Time Insights</h3>
                  <p className="text-sm text-gray-600 transition-colors duration-300">Understand when you're most productive</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-gray-200/50 transition-colors duration-300">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 transition-colors duration-300">Performance Metrics</h3>
                  <p className="text-sm text-gray-600 transition-colors duration-300">Detailed statistics about your task management</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-lg rounded-xl border border-gray-200/50 transition-colors duration-300">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 transition-colors duration-300">Goal Tracking</h3>
                  <p className="text-sm text-gray-600 transition-colors duration-300">Set and monitor your productivity goals</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <p className="text-sm text-gray-500 transition-colors duration-300">
              Stay tuned for updates! We'll notify you when analytics features are available.
            </p>
          </div>
        </div>
    </>
  );
}
