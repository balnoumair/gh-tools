import React from 'react';
import { usePRStore } from '../../stores/pr-store';
import PRItem from './PRItem';

export default function PRList() {
  const { prs, isRefreshing, error } = usePRStore();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="text-mac-red text-[13px]">{error}</div>
          <button
            onClick={() => usePRStore.getState().forceRefresh()}
            className="text-[11px] text-mac-accent hover:text-mac-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isRefreshing && prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-[12px] text-mac-label-tertiary">
          <span className="gh-mark text-mac-accent w-3 h-3 animate-spark" aria-hidden />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="text-[14px] text-mac-label font-medium tracking-tight">
            All caught up
          </div>
          <div className="text-[12px] text-mac-label-tertiary">
            Nothing waiting on you right now.
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
