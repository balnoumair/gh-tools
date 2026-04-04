import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function StatusBar() {
  const { activeRepo, repoStatus, operationStatus, lastResult } = useGitStore();

  const statusColor = {
    idle: 'text-ghv-text-muted',
    running: 'text-ghv-accent',
    success: 'text-ghv-success',
    error: 'text-ghv-error',
  }[operationStatus];

  return (
    <div className="h-6 bg-ghv-surface border-t border-ghv-border flex items-center px-3 gap-4 text-2xs shrink-0">
      {repoStatus && (
        <>
          <span className="text-ghv-accent font-mono">
            {repoStatus.currentBranch}
          </span>
          {repoStatus.hasUncommittedChanges && (
            <span className="text-ghv-warning">
              {repoStatus.modifiedCount}M {repoStatus.stagedCount}S {repoStatus.untrackedCount}U
            </span>
          )}
          {repoStatus.conflictCount > 0 && (
            <span className="text-ghv-error">{repoStatus.conflictCount} conflicts</span>
          )}
        </>
      )}

      <div className="flex-1" />

      {operationStatus !== 'idle' && lastResult && (
        <span className={statusColor}>
          {operationStatus === 'running' ? 'Running...' : lastResult.message}
          {lastResult.duration > 0 && operationStatus !== 'running' && (
            <span className="text-ghv-text-muted ml-1">({lastResult.duration}ms)</span>
          )}
        </span>
      )}

      {activeRepo && (
        <span className="text-ghv-text-muted truncate max-w-[250px]" title={activeRepo.path}>
          {activeRepo.path}
        </span>
      )}
    </div>
  );
}
