import React, { useEffect, useRef, useState } from 'react';
import type { GitWorktree } from '@shared/types';
import { useGitStore } from '../../stores/git-store';
import CommitComposer from './CommitComposer';
import EditorStrip from './EditorStrip';

interface Props {
  worktree: GitWorktree;
  stagedCount: number;
  showLocalBadge?: boolean;
}

function folderName(value: string): string {
  const parts = value.split(/[\\/]/).filter(Boolean);
  return parts.at(-1) ?? value;
}

export default function WorktreeRow({ worktree, stagedCount, showLocalBadge }: Props) {
  const {
    openInEditor,
    commitInWorktree,
    removeWorktree,
    syncWorktree,
    createWorktree,
  } = useGitStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const statusParts = [
    worktree.dirty ? 'changed' : 'clean',
    worktree.ahead > 0 ? `↑${worktree.ahead}` : '',
    worktree.behind > 0 ? `↓${worktree.behind}` : '',
  ].filter(Boolean);

  return (
    <div className="px-2 pb-2">
      <div className="rounded-md border border-mac-separator bg-white/[0.025] px-2.5 py-2">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate text-[12.5px] text-mac-label font-medium" title={worktree.path}>
                {folderName(worktree.path)}
              </span>
              {showLocalBadge && (
                <span className="px-1.5 py-px rounded bg-white/10 text-[9px] uppercase text-mac-label-secondary">
                  primary
                </span>
              )}
              {worktree.dirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-mac-orange shrink-0" title="Uncommitted changes" />
              )}
            </div>
            <div className="mt-0.5 truncate text-[10.5px] text-mac-label-tertiary font-mono">
              {worktree.branch}
            </div>
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              title="Worktree actions"
              aria-label="Worktree actions"
              onClick={() => setMenuOpen((value) => !value)}
              className="h-6 w-6 rounded text-mac-label-tertiary hover:text-mac-label hover:bg-white/5"
            >
              ···
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-50 w-48 rounded-lg border border-mac-separator-heavy bg-mac-bg-menu shadow-menu py-1 animate-menu-in">
                {worktree.dirty && (
                  <MenuItem
                    label="Commit changes"
                    onClick={() => {
                      setComposerOpen(true);
                      setMenuOpen(false);
                    }}
                  />
                )}
                {worktree.behind > 0 && (
                  <MenuItem
                    label={`Sync ${worktree.branch}`}
                    onClick={() => {
                      syncWorktree(worktree.path, worktree.branch);
                      setMenuOpen(false);
                    }}
                  />
                )}
                {worktree.ahead > 0 && (
                  <MenuItem
                    label="Push"
                    onClick={() => {
                      useGitStore.getState().push({ branch: worktree.branch });
                      setMenuOpen(false);
                    }}
                  />
                )}
                <MenuItem
                  label="Reveal in Finder"
                  onClick={() => {
                    openInEditor('finder', worktree.path);
                    setMenuOpen(false);
                  }}
                />
                {worktree.primary && !worktree.branch.startsWith('(detached)') && (
                  <MenuItem
                    label="Create worktree…"
                    onClick={() => {
                      const targetPath = window.prompt(`Path for new worktree (${worktree.branch})`);
                      if (targetPath) void createWorktree(worktree.branch, targetPath);
                      setMenuOpen(false);
                    }}
                  />
                )}
                {!worktree.primary && (
                  <>
                    <div className="my-1 mx-2 border-t border-mac-separator" />
                    <MenuItem
                      label="Remove worktree"
                      danger
                      onClick={() => {
                        removeWorktree(worktree.path);
                        setMenuOpen(false);
                      }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <EditorStrip path={worktree.path} onOpen={openInEditor} />
          <div className="flex-1" />
          <span className="text-[10.5px] text-mac-label-tertiary font-mono tabular-nums">
            {statusParts.join(' · ')}
          </span>
        </div>

        {composerOpen && (
          <CommitComposer
            ahead={worktree.ahead}
            stagedCount={stagedCount}
            onCancel={() => setComposerOpen(false)}
            onCommit={async (message, alsoPush) => {
              await commitInWorktree(worktree.path, message, alsoPush);
              setComposerOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function MenuItem({
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
      type="button"
      onClick={onClick}
      className={`w-[calc(100%-8px)] mx-1 text-left px-2.5 py-1.5 text-[12px] rounded-md transition-colors ${
        danger ? 'text-mac-red' : 'text-mac-label'
      } hover:bg-mac-accent hover:text-[#171717]`}
    >
      {label}
    </button>
  );
}
