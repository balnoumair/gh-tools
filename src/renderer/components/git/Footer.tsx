import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function Footer() {
  const { activeRepo, repoStatus, operationStatus } = useGitStore();
  const changed = repoStatus
    ? repoStatus.untrackedCount + repoStatus.stagedCount + repoStatus.modifiedCount + repoStatus.conflictCount
    : 0;

  return (
    <div className="h-[28px] border-t border-mac-separator bg-mac-bg-toolbar px-3 flex items-center gap-2 text-[10.5px] shrink-0">
      <span className="min-w-0 flex-1 truncate text-mac-label-quaternary font-mono" title={activeRepo?.path}>
        {activeRepo?.path ?? ''}
      </span>
      {operationStatus === 'running' && (
        <span className="flex items-center gap-1 text-mac-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          Running
        </span>
      )}
      <span className={changed > 0 ? 'text-mac-orange font-mono' : 'text-mac-label-tertiary font-mono'}>
        {changed} changed
      </span>
    </div>
  );
}
