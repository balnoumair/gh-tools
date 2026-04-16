import React from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function TrayFooter() {
  const { lastRefreshed, isRefreshing, forceRefresh, prs } = usePRStore();

  const formatTime = (date: Date | null): string => {
    if (!date) return '—';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-mac-separator bg-mac-bg-window/40">
      <div className="flex items-center gap-1.5">
        <span className="chip">
          <span className="w-1.5 h-1.5 rounded-full bg-mac-accent" />
          <span className="tabular-nums">{prs.length}</span>
          <span className="text-mac-label-tertiary">open</span>
        </span>
        <span className="text-[10.5px] text-mac-label-tertiary tabular-nums font-mono">
          {formatTime(lastRefreshed)}
        </span>
      </div>

      <button
        onClick={forceRefresh}
        disabled={isRefreshing}
        className="w-7 h-7 flex items-center justify-center rounded-md text-mac-label-tertiary hover:text-mac-label hover:bg-mac-control-hover transition-colors disabled:opacity-30"
        title="Refresh"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={isRefreshing ? 'animate-spin' : ''}
        >
          <path
            d="M4 4v5h5M20 20v-5h-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.49 9A9 9 0 0 0 5.64 5.64L4 7m16 10l-1.64-1.36A9 9 0 0 1 3.51 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
