import React from 'react';
import { useGitStore } from '../../stores/git-store';

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-mac-label-secondary hover:text-mac-label hover:bg-mac-fill/50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export default function GitToolbar() {
  const {
    operationStatus,
    refreshStatus,
    fetch,
    setShowUpdateDialog,
    setShowPushDialog,
    setShowMergeDialog,
    setShowStashCreateDialog,
    setShowCreateBranchDialog,
  } = useGitStore();

  const busy = operationStatus === 'running';

  return (
    <div className="h-9 border-b border-mac-separator flex items-center px-2 gap-1 shrink-0">
      <ToolbarButton label="Fetch" onClick={() => fetch()} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v8M5 7l3 3 3-3" />
          <path d="M3 12v1h10v-1" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Update" onClick={() => setShowUpdateDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8a6 6 0 0 1 10.5-4M14 8a6 6 0 0 1-10.5 4" />
          <path d="M12.5 1v3h-3M3.5 15v-3h3" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Push" onClick={() => setShowPushDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 12V4M5 7l3-3 3 3" />
          <path d="M3 14h10" />
        </svg>
      </ToolbarButton>

      <div className="w-px h-4 bg-mac-separator mx-1" />

      <ToolbarButton label="Merge" onClick={() => setShowMergeDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="4" cy="4" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M4 6v4M12 10V8a4 4 0 0 0-4-4H6" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Branch" onClick={() => setShowCreateBranchDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 3v10M5 7h4a2 2 0 0 1 2 2v4" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Shelve" onClick={() => setShowStashCreateDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="3" rx="0.5" />
          <rect x="2" y="7" width="12" height="3" rx="0.5" />
          <rect x="2" y="11" width="12" height="3" rx="0.5" />
        </svg>
      </ToolbarButton>

      <div className="flex-1" />

      <ToolbarButton label="Refresh" onClick={() => refreshStatus()} disabled={busy}>
        <svg className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8a6 6 0 0 1 10.5-4M14 8a6 6 0 0 1-10.5 4" />
          <path d="M12.5 1v3h-3M3.5 15v-3h3" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
