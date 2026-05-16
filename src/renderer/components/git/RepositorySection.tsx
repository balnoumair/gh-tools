import React from 'react';
import { useGitStore } from '../../stores/git-store';
import { getPrimaryWorktree } from '../../lib/worktree-utils';
import SectionHeader from './SectionHeader';
import WorktreeRow from './WorktreeRow';

export default function RepositorySection() {
  const { repoStatus } = useGitStore();
  const primary = getPrimaryWorktree(repoStatus?.worktrees ?? []);

  if (!primary) return null;

  return (
    <SectionHeader id="repository" title="Repository" count={1} defaultOpen>
      {(open) =>
        open && (
          <div className="pb-1">
            <WorktreeRow
              worktree={primary}
              stagedCount={repoStatus?.stagedCount ?? 0}
              showLocalBadge
            />
          </div>
        )
      }
    </SectionHeader>
  );
}
