import React from 'react';
import { usePRStore } from '../../stores/pr-store';
import PRItem from './PRItem';

export default function PRList() {
  const { prs, isRefreshing, error } = usePRStore();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center space-y-2">
          <div className="text-ghv-error text-xs font-mono">{error}</div>
          <button
            onClick={() => usePRStore.getState().forceRefresh()}
            className="text-2xs text-ghv-accent hover:text-ghv-accent-dim transition-colors font-mono"
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  if (isRefreshing && prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-ghv-accent rounded-full animate-pulse-dot" />
          <span className="text-xs text-ghv-text-dim">Fetching PRs...</span>
        </div>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center space-y-3">
          <div className="text-ghv-text-muted">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto mb-2 opacity-30"
            >
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-xs text-ghv-text-dim">No PRs awaiting review</div>
          <div className="text-2xs text-ghv-text-muted font-mono">
            You're all caught up
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-ghv-border/50">
      {prs.map((pr, i) => (
        <PRItem key={pr.id} pr={pr} index={i} />
      ))}
    </div>
  );
}
