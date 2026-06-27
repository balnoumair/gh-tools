import React from 'react';
import { useGitStore } from '../../stores/git-store';
import SectionHeader from './SectionHeader';
import WorktreeRow from './WorktreeRow';

export default function WorktreeSection() {
  const { repoStatus } = useGitStore();
  const worktrees = repoStatus?.worktrees ?? [];

  return (
    <SectionHeader
      id="worktrees"
      title="Worktrees"
      count={worktrees.length}
      defaultOpen
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
                  showLocalBadge={worktree.primary}
                />
              ))
            )}
          </div>
        )
      )}
    </SectionHeader>
  );
}
