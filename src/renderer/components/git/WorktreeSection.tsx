import React from 'react';
import { useGitStore } from '../../stores/git-store';
import { getLinkedWorktrees } from '../../lib/worktree-utils';
import SectionHeader from './SectionHeader';
import WorktreeRow from './WorktreeRow';

export default function WorktreeSection() {
  const { repoStatus } = useGitStore();
  const linked = getLinkedWorktrees(repoStatus?.worktrees ?? []);

  return (
    <SectionHeader
      id="worktrees"
      title="Worktrees"
      count={linked.length}
      defaultOpen
    >
      {(open) => (
        open && (
          <div className="pb-1">
            {linked.length === 0 ? (
              <p className="px-3 pb-2 text-[11.5px] text-mac-label-tertiary">No linked worktrees</p>
            ) : (
              linked.map((worktree) => (
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
