import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function CurrentBranchStrip() {
  const { repoStatus } = useGitStore();
  const branch = repoStatus?.branches.find((item) => item.current);

  return (
    <div className="mx-3 mt-3 mb-2 rounded-md border border-mac-separator-heavy bg-white/[0.035] px-3 py-2 flex items-center gap-2">
      <span className="gh-mark w-4 h-4 text-mac-label-secondary" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-mac-label font-mono">
        {repoStatus?.currentBranch ?? 'No branch'}
      </span>
      {branch && (branch.ahead > 0 || branch.behind > 0) && (
        <span className="text-[11px] text-mac-label-secondary font-mono tabular-nums">
          {branch.ahead > 0 ? `↑${branch.ahead}` : ''}
          {branch.ahead > 0 && branch.behind > 0 ? ' ' : ''}
          {branch.behind > 0 ? `↓${branch.behind}` : ''}
        </span>
      )}
      {repoStatus?.hasUncommittedChanges && (
        <span className="w-2 h-2 rounded-full bg-mac-orange" title="Uncommitted changes" />
      )}
    </div>
  );
}
