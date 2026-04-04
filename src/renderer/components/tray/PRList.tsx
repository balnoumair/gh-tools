import React from 'react';
import { usePRStore } from '../../stores/pr-store';
import PRItem from './PRItem';

export default function PRList() {
  const { prs, isRefreshing, error } = usePRStore();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center space-y-2">
          <div className="text-mac-danger text-[13px]">{error}</div>
          <button
            onClick={() => usePRStore.getState().forceRefresh()}
            className="text-[11px] text-mac-primary hover:underline transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isRefreshing && prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[13px] text-mac-label-secondary">Loading...</span>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center space-y-1">
          <div className="text-[13px] font-medium text-mac-label-secondary">
            No Pull Requests
          </div>
          <div className="text-[11px] text-mac-label-tertiary">
            You're all caught up
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-mac-separator">
      {prs.map((pr, i) => (
        <PRItem key={pr.id} pr={pr} index={i} />
      ))}
    </div>
  );
}
