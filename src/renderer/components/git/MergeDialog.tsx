import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';
import Dialog from './Dialog';

export default function MergeDialog() {
  const { showMergeDialog, setShowMergeDialog, repoStatus, merge } = useGitStore();
  const [sourceBranch, setSourceBranch] = useState('');
  const [noFastForward, setNoFastForward] = useState(false);

  const localBranches = repoStatus?.branches.filter((b) => !b.isRemote && !b.current) ?? [];
  const currentBranch = repoStatus?.currentBranch ?? '';

  const handleMerge = () => {
    if (!sourceBranch) return;
    merge({ sourceBranch, targetBranch: currentBranch, noFastForward });
    setSourceBranch('');
    setNoFastForward(false);
  };

  return (
    <Dialog open={showMergeDialog} onClose={() => setShowMergeDialog(false)} title="Merge Branches">
      <div className="space-y-4">
        <div>
          <label className="block text-2xs text-ghv-text-muted mb-1">Source branch (merge from)</label>
          <select
            value={sourceBranch}
            onChange={(e) => setSourceBranch(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-ghv-bg border border-ghv-border rounded text-ghv-text focus:outline-none focus:border-ghv-accent/50"
          >
            <option value="">Select branch...</option>
            {localBranches.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-2xs text-ghv-text-muted mb-1">Target branch (merge into)</label>
          <div className="px-2 py-1.5 text-xs bg-ghv-bg/50 border border-ghv-border rounded text-ghv-accent font-mono">
            {currentBranch}
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-ghv-text-dim cursor-pointer">
          <input
            type="checkbox"
            checked={noFastForward}
            onChange={(e) => setNoFastForward(e.target.checked)}
            className="rounded border-ghv-border"
          />
          No fast-forward (always create merge commit)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowMergeDialog(false)}
            className="px-3 py-1.5 text-xs text-ghv-text-dim hover:text-ghv-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={!sourceBranch}
            className="px-3 py-1.5 text-xs bg-ghv-accent/10 border border-ghv-accent/30 text-ghv-accent rounded hover:bg-ghv-accent/20 transition-colors disabled:opacity-40"
          >
            Merge
          </button>
        </div>
      </div>
    </Dialog>
  );
}
