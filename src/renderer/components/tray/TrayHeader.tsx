import React from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function TrayHeader() {
  const { authStatus } = usePRStore();

  const handleOpenGitManager = () => {
    window.electronAPI.openFullWindow();
  };

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      <div className="flex items-center gap-2.5">
        <span className="gh-mark text-mac-accent w-[14px] h-[14px] animate-spark" aria-hidden />
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium text-mac-label tracking-tight">
            Pull requests
          </span>
          {authStatus?.username && (
            <span className="text-[10.5px] text-mac-label-tertiary font-mono">
              @{authStatus.username}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleOpenGitManager}
        className="w-7 h-7 flex items-center justify-center rounded-md text-mac-label-tertiary hover:text-mac-label hover:bg-mac-control-hover transition-colors"
        title="Open Git Manager"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
