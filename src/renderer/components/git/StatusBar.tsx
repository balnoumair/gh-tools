import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function StatusBar() {
  const { activeRepo, repoStatus, operationStatus, lastResult } = useGitStore();

  const statusColor = {
    idle: 'text-mac-label-tertiary',
    running: 'text-mac-primary',
    success: 'text-mac-success',
    error: 'text-mac-danger',
  }[operationStatus];

  return (
    <div className="h-6 border-t border-mac-separator flex items-center px-3 gap-4 text-[11px] shrink-0">
      {repoStatus && (
        <>
          <span className="text-mac-primary font-mono">
            {repoStatus.currentBranch}
          </span>
          {repoStatus.hasUncommittedChanges && (
            <span className="text-mac-warning">
              {repoStatus.modifiedCount}M {repoStatus.stagedCount}S {repoStatus.untrackedCount}U
            </span>
          )}
          {repoStatus.conflictCount > 0 && (
            <span className="text-mac-danger">{repoStatus.conflictCount} conflicts</span>
          )}
        </>
      )}

      <div className="flex-1" />

      {operationStatus !== 'idle' && lastResult && (
        <span className={statusColor}>
          {operationStatus === 'running' ? 'Running...' : lastResult.message}
          {lastResult.duration > 0 && operationStatus !== 'running' && (
            <span className="text-mac-label-tertiary ml-1">({lastResult.duration}ms)</span>
          )}
        </span>
      )}

      {activeRepo && (
        <span className="text-mac-label-tertiary truncate max-w-[250px]" title={activeRepo.path}>
          {activeRepo.path}
        </span>
      )}
    </div>
  );
}
