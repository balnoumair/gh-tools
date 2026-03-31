import React from 'react';

export default function FullApp() {
  return (
    <div className="h-full flex flex-col bg-ghv-bg bg-grid">
      <div className="h-10 bg-ghv-surface border-b border-ghv-border flex items-center px-4 drag-region">
        <span className="text-xs text-ghv-text-dim font-mono tracking-wider uppercase">
          git manager
        </span>
        <span className="ml-2 text-2xs text-ghv-text-muted">// Phase 2</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-ghv-text-dim text-sm">
            Git Manager — coming in Phase 2
          </div>
          <div className="text-ghv-text-muted text-xs font-mono">
            Branch ops, merge conflicts, diff viewer
          </div>
        </div>
      </div>
    </div>
  );
}
