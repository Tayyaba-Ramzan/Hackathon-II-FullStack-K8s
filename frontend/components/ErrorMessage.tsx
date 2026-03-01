/**
 * ErrorMessage Component
 *
 * Displays error messages with retry functionality.
 */
'use client';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorMessage({
  message,
  onRetry,
  onDismiss
}: ErrorMessageProps) {
  return (
    <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200/80 rounded-2xl p-4 shadow-lg shadow-rose-500/10 animate-slide-in-up">
      <div className="flex items-start gap-3.5">
        {/* Error Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center ring-2 ring-rose-200/50">
          <svg
            className="w-5 h-5 text-rose-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-rose-900 mb-1.5 flex items-center gap-2">
            Something went wrong
          </h3>
          <p className="text-sm text-rose-800 leading-relaxed">
            {message}
          </p>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3.5 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all duration-200"
            aria-label="Dismiss error"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
