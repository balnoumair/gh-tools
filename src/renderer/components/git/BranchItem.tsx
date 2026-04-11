import React, { useState, useRef, useEffect } from 'react';
import { useGitStore } from '../../stores/git-store';
import type { GitBranch } from '@shared/types';

interface Props {
  branch: GitBranch;
}

export default function BranchItem({ branch }: Props) {
  const { checkoutBranch, deleteBranch, repoStatus } = useGitStore();
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

  const displayName = branch.isRemote
    ? branch.name.split('/').slice(1).join('/')
    : branch.name;

  return (
    <>
      <div
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={`flex items-center gap-1.5 pl-6 pr-2 py-[2px] mx-1 rounded-[4px] text-[12px] cursor-default select-none transition-colors
          ${branch.current
            ? 'bg-mac-selection text-mac-selection-text'
            : 'hover:bg-mac-control-active text-mac-label'
          }`}
      >
        <span className={`truncate font-mono text-[11px] ${branch.current ? 'font-medium' : ''}`} title={branch.name}>
          {displayName}
        </span>

        {branch.current && (branch.ahead > 0 || branch.behind > 0) && (
          <span className="ml-auto flex items-center gap-0.5 text-[10px] shrink-0 font-medium tabular-nums">
            {branch.ahead > 0 && <span className="text-mac-green">↑{branch.ahead}</span>}
            {branch.behind > 0 && <span className="text-mac-orange">↓{branch.behind}</span>}
          </span>
        )}

        <span className="ml-auto text-[10px] text-mac-label-quaternary font-mono shrink-0">
          {branch.commitHash}
        </span>
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-mac-bg-menu backdrop-blur-2xl border border-mac-separator-heavy rounded-md shadow-menu z-[100] py-[3px] min-w-[200px] animate-menu-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {branch.current && (
            <ContextMenuItem
              label="Copy Branch Name"
              onClick={() => { navigator.clipboard.writeText(branch.name); setContextMenu(null); }}
            />
          )}
          {!branch.current && (
            <ContextMenuItem
              label="Checkout"
              onClick={() => { checkoutBranch(branch.name); setContextMenu(null); }}
            />
          )}
          {!branch.current && !branch.isRemote && (
            <ContextMenuItem
              label={`Merge into '${repoStatus?.currentBranch}'`}
              onClick={() => {
                setContextMenu(null);
                useGitStore.getState().merge({
                  sourceBranch: branch.name,
                  targetBranch: repoStatus?.currentBranch ?? '',
                });
              }}
            />
          )}
          {!branch.current && !branch.isRemote && (
            <>
              <div className="border-t border-mac-separator-heavy mx-2 my-[3px]" />
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
      className={`w-[calc(100%-6px)] mx-[3px] text-left px-2 py-[3px] text-[13px] rounded-[4px] transition-colors
        ${danger ? 'text-mac-red' : 'text-mac-label'}
        hover:bg-mac-accent hover:text-white`}
    >
      {label}
    </button>
  );
}
