import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#F7F8FA] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-teal-500 animate-pulse flex items-center justify-center shadow-lg shadow-teal-500/30">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path className="animate-pulse" d="M7 4c2 4-2 12 0 16" />
              <path className="animate-pulse" style={{ animationDelay: '0.2s' }} d="M12 4c2 4-2 12 0 16" />
              <path className="animate-pulse" style={{ animationDelay: '0.4s' }} d="M17 4c2 4-2 12 0 16" />
            </svg>
          </div>
          <div className="absolute -inset-1 bg-teal-500/20 rounded-2xl animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-[#0E1A2B] tracking-tight">Loading...</p>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
