import React from 'react';
import { useGitStore } from '../../stores/git-store';

function Icon({ type }: { type: 'commit' | 'push' | 'sync' | 'fetch' }) {
  if (type === 'commit') {
    return <span className="gh-mark w-3.5 h-3.5" aria-hidden />;
  }

  if (type === 'push') {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 12V4M5 7l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 14h10" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'sync') {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.5 7a5.5 5.5 0 0 1 9.4-3.9M13.5 9a5.5 5.5 0 0 1-9.4 3.9" strokeLinecap="round" />
        <path d="M12 1v3h-3M4 15v-3h3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13h10" strokeLinecap="round" />
    </svg>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
  disabled,
  primary,
  badge,
  iconOnly,
}: {
  label: string;
  icon: 'commit' | 'push' | 'sync' | 'fetch';
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  badge?: number;
  iconOnly?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`h-8 inline-flex items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none ${
        primary
          ? 'bg-white text-[#171717] hover:bg-white/90'
          : 'bg-white/[0.055] text-mac-label-secondary hover:text-mac-label hover:bg-white/[0.08]'
      } ${iconOnly ? 'w-8 px-0' : ''}`}
    >
      <Icon type={icon} />
      {!iconOnly && <span>{label}</span>}
      {badge !== undefined && badge > 0 && (
        <span className="ml-0.5 rounded-full bg-black/15 px-1.5 py-px text-[10px] font-mono tabular-nums">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Toolbar() {
  const {
    operationStatus,
    repoStatus,
    setShowPushDialog,
    setShowUpdateDialog,
    fetch,
    showToast,
  } = useGitStore();
  const busy = operationStatus === 'running';

  return (
    <div className="h-[44px] px-3 flex items-center gap-2 border-t border-mac-separator bg-mac-bg-toolbar shrink-0">
      <ToolbarButton
        label="Commit"
        icon="commit"
        primary
        badge={repoStatus?.stagedCount}
        disabled={busy}
        onClick={() => showToast('Use a dirty worktree row to commit changes', 'info')}
      />
      <ToolbarButton label="Push" icon="push" disabled={busy} onClick={() => setShowPushDialog(true)} />
      <ToolbarButton label="Sync" icon="sync" disabled={busy} onClick={() => setShowUpdateDialog(true)} />
      <div className="flex-1" />
      <ToolbarButton label="Fetch" icon="fetch" iconOnly disabled={busy} onClick={() => fetch()} />
    </div>
  );
}
