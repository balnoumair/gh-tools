import React from 'react';
import { usePRStore } from '../../stores/pr-store';
import { getVisibleTrayPRs } from './pr-visibility';

export default function TrayHeader() {
  const { prs, isRefreshing, forceRefresh } = usePRStore();
  const visibleCount = getVisibleTrayPRs(prs).length;

  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-mac-separator">
      <div className="flex items-center gap-2.5">
        <span className="gh-mark text-mac-label-secondary w-[14px] h-[14px]" aria-hidden />
        <span className="text-[13px] font-semibold text-mac-label tracking-tight">
          Pull requests
        </span>
        <span className="text-[11px] text-mac-label-tertiary font-mono tabular-nums">
          {visibleCount}
        </span>
      </div>

      <button
        onClick={forceRefresh}
        disabled={isRefreshing}
        className="w-[26px] h-[26px] flex items-center justify-center rounded-md text-mac-label-tertiary hover:text-mac-label hover:bg-mac-control-hover transition-colors disabled:opacity-30 focus:outline-none"
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
