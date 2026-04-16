import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function StatusBar() {
  const { activeRepo, repoStatus, operationStatus, lastResult } = useGitStore();

  const statusColor = {
    idle: 'text-mac-label-tertiary',
    running: 'text-mac-accent',
    success: 'text-mac-green',
    error: 'text-mac-red',
  }[operationStatus];

  return (
    <div className="h-[26px] border-t border-mac-separator bg-mac-bg-toolbar flex items-center px-3 gap-2 text-[11px] shrink-0">
      {repoStatus && (
        <>
          <span className="chip chip-accent !h-[18px] !px-2 !text-[10.5px]">
            <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 3v10M5 7h4a2 2 0 0 1 2 2v4" strokeLinecap="round" />
            </svg>
            <span className="font-mono font-medium">{repoStatus.currentBranch}</span>
          </span>

          {repoStatus.hasUncommittedChanges && (
            <span className="text-mac-orange font-medium tabular-nums font-mono text-[10.5px]">
              {repoStatus.modifiedCount}M · {repoStatus.stagedCount}S · {repoStatus.untrackedCount}U
            </span>
          )}
          {repoStatus.conflictCount > 0 && (
            <span className="text-mac-red font-medium text-[10.5px]">{repoStatus.conflictCount} conflicts</span>
          )}
        </>
      )}

      <div className="flex-1" />

      {operationStatus !== 'idle' && lastResult && (
        <span className={`${statusColor} text-[10.5px]`}>
          {operationStatus === 'running' ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
              Running…
            </span>
          ) : (
            <>
              {lastResult.message}
              {lastResult.duration > 0 && (
                <span className="text-mac-label-quaternary ml-1 font-mono">({lastResult.duration}ms)</span>
              )}
            </>
          )}
        </span>
      )}

      {activeRepo && (
        <span className="text-mac-label-quaternary truncate max-w-[260px] font-mono text-[10.5px]" title={activeRepo.path}>
          {activeRepo.path}
        </span>
      )}
    </div>
  );
}
