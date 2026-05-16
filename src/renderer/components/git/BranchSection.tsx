import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGitStore } from '../../stores/git-store';
import { localBranchesWithoutWorktree } from '../../lib/worktree-utils';
import type { GitBranch } from '@shared/types';
import SectionHeader from './SectionHeader';

interface Props {
  kind: 'local' | 'remote';
}

function promptCreateWorktree(branchName: string, createWorktree: (branch: string, targetPath: string) => void) {
  const targetPath = window.prompt(`Path for new worktree (${branchName})`);
  if (!targetPath) return;
  void createWorktree(branchName, targetPath);
}

function LocalBranchRow({
  branch,
  onCheckout,
  onCreateWorktree,
}: {
  branch: GitBranch;
  onCheckout: () => void;
  onCreateWorktree: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div className="relative mx-2 mb-1" ref={menuRef}>
      <div
        role="button"
        tabIndex={0}
        onDoubleClick={onCheckout}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onCheckout();
        }}
        className="w-full rounded-md px-2.5 py-1.5 flex items-center gap-2 text-left transition-colors text-mac-label hover:bg-white/[0.045] cursor-default"
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-mac-label-quaternary" />
        <span className="min-w-0 flex-1 truncate text-[11.5px] font-mono">{branch.name}</span>
        <span className="text-[10px] text-mac-label-quaternary shrink-0">no worktree</span>
        <span className="text-[10px] text-mac-label-quaternary font-mono">{branch.commitHash}</span>
        <button
          type="button"
          title="Branch actions"
          aria-label="Branch actions"
          onClick={() => setMenuOpen((value) => !value)}
          className="h-5 w-5 rounded text-mac-label-tertiary hover:text-mac-label hover:bg-white/5 shrink-0"
        >
          ···
        </button>
      </div>
      {menuOpen && (
        <div className="absolute right-0 top-8 z-50 w-52 rounded-lg border border-mac-separator-heavy bg-mac-bg-menu shadow-menu py-1 animate-menu-in">
          <MenuItem label="Create worktree…" onClick={() => { onCreateWorktree(); setMenuOpen(false); }} />
          <MenuItem label="Checkout in repository" onClick={() => { onCheckout(); setMenuOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[calc(100%-8px)] mx-1 text-left px-2.5 py-1.5 text-[12px] rounded-md text-mac-label hover:bg-mac-accent hover:text-[#171717] transition-colors"
    >
      {label}
    </button>
  );
}

export default function BranchSection({ kind }: Props) {
  const { repoStatus, checkoutBranch, createWorktree } = useGitStore();

  const branches = useMemo(() => {
    const all = repoStatus?.branches ?? [];
    if (kind === 'remote') {
      return all.filter((branch) => branch.isRemote);
    }
    return localBranchesWithoutWorktree(all, repoStatus?.worktrees ?? []);
  }, [kind, repoStatus]);

  return (
    <SectionHeader
      id={kind === 'local' ? 'local-branches' : 'remote-branches'}
      title={kind === 'local' ? 'Local' : 'Remote'}
      count={branches.length}
      defaultOpen={kind === 'local'}
    >
      {(open) => (
        open && (
          <div className="pb-1">
            {branches.length === 0 ? (
              <p className="px-3 pb-2 text-[11.5px] text-mac-label-tertiary">
                {kind === 'local' ? 'All local branches have a worktree' : 'No branches'}
              </p>
            ) : kind === 'local' ? (
              branches.map((branch) => (
                <LocalBranchRow
                  key={branch.name}
                  branch={branch}
                  onCheckout={() => checkoutBranch(branch.name)}
                  onCreateWorktree={() => promptCreateWorktree(branch.name, createWorktree)}
                />
              ))
            ) : (
              branches.map((branch) => (
                <button
                  type="button"
                  key={branch.name}
                  className="mx-2 mb-1 w-[calc(100%-16px)] rounded-md px-2.5 py-1.5 flex items-center gap-2 text-left transition-colors text-mac-label hover:bg-white/[0.045]"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-mac-label-quaternary" />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-mono">
                    {branch.name.split('/').slice(1).join('/')}
                  </span>
                  <span className="text-[10px] text-mac-label-quaternary font-mono">{branch.commitHash}</span>
                </button>
              ))
            )}
          </div>
        )
      )}
    </SectionHeader>
  );
}
