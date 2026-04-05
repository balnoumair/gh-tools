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
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Source branch (merge from)</label>
          <select
            value={sourceBranch}
            onChange={(e) => setSourceBranch(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[13px] bg-mac-fill/50 border border-mac-separator rounded-md text-mac-label focus:outline-none focus:ring-2 focus:ring-mac-primary/50 focus:border-mac-primary transition-colors"
          >
            <option value="">Select branch...</option>
            {localBranches.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Target branch (merge into)</label>
          <div className="px-2.5 py-1.5 text-[13px] bg-mac-fill/30 border border-mac-separator rounded-md text-mac-primary font-mono">
            {currentBranch}
          </div>
        </div>

        <label className="flex items-center gap-2 text-[13px] text-mac-label-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={noFastForward}
            onChange={(e) => setNoFastForward(e.target.checked)}
            className="rounded border-mac-separator"
          />
          No fast-forward (always create merge commit)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowMergeDialog(false)}
            className="px-3 py-1.5 text-[13px] text-mac-label-secondary hover:text-mac-label transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={!sourceBranch}
            className="px-3 py-1.5 text-[13px] bg-mac-primary text-white rounded-md hover:bg-mac-primary-hover active:brightness-90 transition-colors disabled:opacity-40"
          >
            Merge
          </button>
        </div>
      </div>
    </Dialog>
  );
}
