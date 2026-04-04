import React from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function TrayHeader() {
  const { authStatus } = usePRStore();

  const handleOpenGitManager = () => {
    window.electronAPI.openFullWindow();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-mac-separator">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-mac-label">
          Pull Requests
        </span>
        {authStatus?.username && (
          <span className="text-[11px] text-mac-label-tertiary">
            @{authStatus.username}
          </span>
        )}
      </div>

      <button
        onClick={handleOpenGitManager}
        className="text-mac-label-tertiary hover:text-mac-label-secondary transition-colors"
        title="Open Git Manager"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
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
