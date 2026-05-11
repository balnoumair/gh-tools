import React from 'react';
import { useGitStore } from '../../stores/git-store';
import SectionHeader from './SectionHeader';
import WorktreeRow from './WorktreeRow';

export default function WorktreeSection() {
  const { repoStatus, createWorktree } = useGitStore();
  const worktrees = repoStatus?.worktrees ?? [];

  return (
    <SectionHeader
      id="worktrees"
      title="Worktrees"
      count={worktrees.length}
      defaultOpen
      action={
        <button
          type="button"
          title="Create worktree"
          onClick={() => {
            const branch = window.prompt('Branch for new worktree');
            if (!branch) return;
            const targetPath = window.prompt('Target path for new worktree');
            if (!targetPath) return;
            createWorktree(branch, targetPath);
          }}
          className="h-5 w-5 rounded text-mac-label-tertiary hover:text-mac-label hover:bg-white/5"
        >
          +
        </button>
      }
    >
      {(open) => (
        open && (
          <div className="pb-1">
            {worktrees.length === 0 ? (
              <p className="px-3 pb-2 text-[11.5px] text-mac-label-tertiary">No worktrees</p>
            ) : (
              worktrees.map((worktree) => (
                <WorktreeRow
                  key={worktree.path}
                  worktree={worktree}
                  stagedCount={repoStatus?.stagedCount ?? 0}
                />
              ))
            )}
          </div>
        )
      )}
    </SectionHeader>
  );
}
