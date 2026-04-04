import React, { useState, useRef, useEffect } from 'react';
import { useGitStore } from '../../stores/git-store';
import type { GitBranch } from '@shared/types';

interface Props {
  branch: GitBranch;
}

export default function BranchItem({ branch }: Props) {
  const { checkoutBranch, setShowMergeDialog, deleteBranch, repoStatus } = useGitStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  const handleDoubleClick = () => {
    if (!branch.current) {
      checkoutBranch(branch.name);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Display name: strip remote prefix for display
  const displayName = branch.isRemote
    ? branch.name.split('/').slice(1).join('/')
    : branch.name;

  return (
    <>
      <div
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={`flex items-center gap-2 px-3 py-1 mx-1 rounded text-xs cursor-default select-none transition-colors hover:bg-ghv-surface-hover ${
          branch.current ? 'text-ghv-accent' : 'text-ghv-text-dim'
        }`}
      >
        {/* Current branch indicator */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${branch.current ? 'bg-ghv-accent' : 'bg-transparent'}`} />

        <span className="truncate font-mono text-2xs" title={branch.name}>
          {displayName}
        </span>

        {/* Ahead/behind badges */}
        {branch.current && (branch.ahead > 0 || branch.behind > 0) && (
          <span className="ml-auto flex items-center gap-1 text-2xs shrink-0">
            {branch.ahead > 0 && (
              <span className="text-ghv-success">↑{branch.ahead}</span>
            )}
            {branch.behind > 0 && (
              <span className="text-ghv-warning">↓{branch.behind}</span>
            )}
          </span>
        )}

        <span className="ml-auto text-2xs text-ghv-text-muted font-mono shrink-0">
          {branch.commitHash}
        </span>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-ghv-surface border border-ghv-border rounded shadow-lg z-[100] py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {!branch.current && (
            <ContextMenuItem
              label="Checkout"
              onClick={() => { checkoutBranch(branch.name); setContextMenu(null); }}
            />
          )}
          {!branch.current && !branch.isRemote && (
            <ContextMenuItem
              label={`Merge '${displayName}' into '${repoStatus?.currentBranch}'`}
              onClick={() => {
                setContextMenu(null);
                // Pre-fill merge: source = this branch, target = current
                useGitStore.getState().merge({
                  sourceBranch: branch.name,
                  targetBranch: repoStatus?.currentBranch ?? '',
                });
              }}
            />
          )}
          {!branch.current && !branch.isRemote && (
            <>
              <div className="border-t border-ghv-border my-1" />
              <ContextMenuItem
                label="Delete"
                danger
                onClick={() => { deleteBranch(branch.name); setContextMenu(null); }}
              />
              <ContextMenuItem
                label="Force Delete"
                danger
                onClick={() => { deleteBranch(branch.name, true); setContextMenu(null); }}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

function ContextMenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
        danger
          ? 'text-ghv-error hover:bg-ghv-error/10'
          : 'text-ghv-text-dim hover:bg-ghv-surface-hover hover:text-ghv-text'
      }`}
    >
      {label}
    </button>
  );
}
