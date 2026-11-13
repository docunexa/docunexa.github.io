import React from 'react';
import { ToolImplementationStatus } from '../../types';

interface StatusBadgeProps {
  status: ToolImplementationStatus;
  notice?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, notice, className = '' }) => {
  if (status === 'fully-implemented') {
    return (
      <span
        title={notice || 'Fully implemented client-side'}
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-df-blue/10 text-df-blue border border-df-blue/20 ${className}`}
      >
        Verified
      </span>
    );
  }

  if (status === 'partially-supported') {
    return (
      <span
        title={notice || 'Partially supported client-side'}
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-df-pink/10 text-df-pink border border-df-pink/20 ${className}`}
      >
        Partial
      </span>
    );
  }

  return (
    <span
      title={notice || 'Requires external backend service'}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-df-black/10 dark:bg-df-white/10 text-df-black/60 dark:text-df-white/60 border border-df-black/10 dark:border-df-white/10 ${className}`}
    >
      External
    </span>
  );
};

