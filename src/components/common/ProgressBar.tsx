import React from 'react';

interface ProgressBarProps {
  progress?: number;
  message?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  message,
  className = '',
}) => {
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-df-black/80 dark:text-df-white/80 truncate max-w-[80%]">
          {message || 'Processing...'}
        </span>
        <span className="font-mono text-df-blue font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-df-black/10 dark:bg-df-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-df-blue transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

