import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'text' | 'avatar' | 'stat';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  type = 'card',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const shimmerAnimation = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-lg animate-fade-in ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-3">
                <div className={`h-5 bg-gray-200 rounded-lg w-3/4 ${shimmerAnimation}`} />
                <div className={`h-4 bg-gray-200 rounded-lg w-1/2 ${shimmerAnimation}`} style={{ animationDelay: '0.1s' }} />
              </div>
              <div className={`h-10 w-10 bg-gray-200 rounded-xl ${shimmerAnimation}`} style={{ animationDelay: '0.2s' }} />
            </div>
            {/* Content */}
            <div className="space-y-2">
              <div className={`h-3 bg-gray-200 rounded w-full ${shimmerAnimation}`} style={{ animationDelay: '0.3s' }} />
              <div className={`h-3 bg-gray-200 rounded w-5/6 ${shimmerAnimation}`} style={{ animationDelay: '0.4s' }} />
              <div className={`h-3 bg-gray-200 rounded w-4/6 ${shimmerAnimation}`} style={{ animationDelay: '0.5s' }} />
            </div>
            {/* Footer */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className={`h-6 w-20 bg-gray-200 rounded-full ${shimmerAnimation}`} style={{ animationDelay: '0.6s' }} />
              <div className={`h-6 w-24 bg-gray-200 rounded-full ${shimmerAnimation}`} style={{ animationDelay: '0.7s' }} />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-200/50 shadow-sm animate-fade-in ${className}`}>
            <div className="flex items-center gap-4">
              <div className={`h-5 w-5 bg-gray-200 rounded ${shimmerAnimation}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 bg-gray-200 rounded w-3/4 ${shimmerAnimation}`} />
                <div className={`h-3 bg-gray-200 rounded w-1/2 ${shimmerAnimation}`} style={{ animationDelay: '0.1s' }} />
              </div>
              <div className={`h-8 w-8 bg-gray-200 rounded-lg ${shimmerAnimation}`} style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        );

      case 'stat':
        return (
          <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-lg animate-fade-in ${className}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className={`h-4 bg-gray-200 rounded w-1/2 ${shimmerAnimation}`} />
                <div className={`h-8 bg-gray-200 rounded-lg w-1/3 ${shimmerAnimation}`} style={{ animationDelay: '0.1s' }} />
              </div>
              <div className={`h-12 w-12 bg-gray-200 rounded-xl ${shimmerAnimation}`} style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            <div className={`h-4 bg-gray-200 rounded w-full ${shimmerAnimation}`} />
            <div className={`h-4 bg-gray-200 rounded w-5/6 ${shimmerAnimation}`} style={{ animationDelay: '0.1s' }} />
            <div className={`h-4 bg-gray-200 rounded w-4/6 ${shimmerAnimation}`} style={{ animationDelay: '0.2s' }} />
          </div>
        );

      case 'avatar':
        return (
          <div className={`flex items-center gap-3 ${className}`}>
            <div className={`h-12 w-12 bg-gray-200 rounded-full ${shimmerAnimation}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 bg-gray-200 rounded w-1/2 ${shimmerAnimation}`} style={{ animationDelay: '0.1s' }} />
              <div className={`h-3 bg-gray-200 rounded w-1/3 ${shimmerAnimation}`} style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}
