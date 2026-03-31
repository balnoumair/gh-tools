import React from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function TrayHeader() {
  const { authStatus } = usePRStore();

  const handleOpenGitManager = () => {
    window.electronAPI.openFullWindow();
  };

  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-ghv-border bg-ghv-surface/50">
      <div className="flex items-center gap-2">
        {/* Logo mark */}
        <div className="w-5 h-5 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M5 3v10M5 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
              stroke="#00e5ff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M11 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM11 3v4c0 1.5-1 2-3 2.5"
              stroke="#00e5ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>
        <span className="text-xs font-semibold tracking-wide text-ghv-text">
          gh-viewer
        </span>
        {authStatus?.username && (
          <span className="text-2xs text-ghv-text-muted font-mono">
            @{authStatus.username}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleOpenGitManager}
          className="px-2 py-1 text-2xs font-mono text-ghv-accent border border-ghv-accent/30
                     hover:bg-ghv-accent/10 hover:border-ghv-accent/60 transition-colors"
          title="Open Git Manager"
        >
          GIT
        </button>
      </div>
    </div>
  );
}
