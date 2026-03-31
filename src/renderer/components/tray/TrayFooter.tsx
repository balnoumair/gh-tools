import React from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function TrayFooter() {
  const { lastRefreshed, isRefreshing, forceRefresh, prs } = usePRStore();

  const formatTime = (date: Date | null): string => {
    if (!date) return 'never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-ghv-border bg-ghv-surface/30">
      <div className="flex items-center gap-2">
        <span className="text-2xs text-ghv-text-muted font-mono tabular-nums">
          {prs.length} PR{prs.length !== 1 ? 's' : ''}
        </span>
        <span className="text-2xs text-ghv-text-muted">·</span>
        <span className="text-2xs text-ghv-text-muted font-mono tabular-nums">
          {formatTime(lastRefreshed)}
        </span>
      </div>

      <button
        onClick={forceRefresh}
        disabled={isRefreshing}
        className="text-2xs text-ghv-text-dim hover:text-ghv-accent transition-colors
                   disabled:opacity-30 font-mono"
        title="Force refresh"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className={isRefreshing ? 'animate-spin' : ''}
        >
          <path
            d="M4 4v5h5M20 20v-5h-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.49 9A9 9 0 0 0 5.64 5.64L4 7m16 10l-1.64-1.36A9 9 0 0 1 3.51 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
