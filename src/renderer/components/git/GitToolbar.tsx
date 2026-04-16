import React from 'react';
import { useGitStore } from '../../stores/git-store';

function ToolbarButton({
  label,
  onClick,
  disabled,
  accent,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-[5px] text-[11.5px] font-medium rounded-md transition-colors disabled:opacity-25 disabled:pointer-events-none tracking-tight
        ${accent
          ? 'text-mac-accent hover:bg-mac-accent-soft'
          : 'text-mac-label-secondary hover:text-mac-label hover:bg-mac-control-hover active:bg-mac-control-active'
        }`}
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
    <div className="h-[36px] border-t border-mac-separator bg-mac-bg-toolbar flex items-center px-2 gap-px shrink-0">
      <ToolbarButton label="Fetch" onClick={() => fetch()} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 12v1h10v-1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Update" onClick={() => setShowUpdateDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2 8a6 6 0 0 1 10.5-4M14 8a6 6 0 0 1-10.5 4" strokeLinecap="round" />
          <path d="M12.5 1v3h-3M3.5 15v-3h3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Push" onClick={() => setShowPushDialog(true)} disabled={busy} accent>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M8 12V4M5 7l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 14h10" strokeLinecap="round" />
        </svg>
      </ToolbarButton>

      <div className="w-px h-3.5 bg-mac-separator mx-1.5" />

      <ToolbarButton label="Merge" onClick={() => setShowMergeDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="4" cy="4" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M4 6v4M12 10V8a4 4 0 0 0-4-4H6" strokeLinecap="round" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Branch" onClick={() => setShowCreateBranchDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="5" cy="3.5" r="1.5" />
          <circle cx="5" cy="12.5" r="1.5" />
          <circle cx="11" cy="6.5" r="1.5" />
          <path d="M5 5v6M5 9.5C5 8 6.5 7 8 7h1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Shelve" onClick={() => setShowStashCreateDialog(true)} disabled={busy}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="2.5" y="3.5" width="11" height="3" rx="1" />
          <rect x="2.5" y="8" width="11" height="3" rx="1" />
          <rect x="3.5" y="12.5" width="9" height="1.5" rx="0.75" />
        </svg>
      </ToolbarButton>

      <div className="flex-1" />

      <ToolbarButton label="Refresh" onClick={() => refreshStatus()} disabled={busy}>
        <svg className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2 8a6 6 0 0 1 10.5-4M14 8a6 6 0 0 1-10.5 4" strokeLinecap="round" />
          <path d="M12.5 1v3h-3M3.5 15v-3h3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
