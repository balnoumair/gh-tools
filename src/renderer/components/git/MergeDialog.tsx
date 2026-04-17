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
      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Source branch (merge from)</label>
          <select
            value={sourceBranch}
            onChange={(e) => setSourceBranch(e.target.value)}
            className="mac-select w-full"
          >
            <option value="">Select branch...</option>
            {localBranches.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Target branch (merge into)</label>
          <div className="px-[7px] py-[3px] text-[13px] bg-mac-control-bg border border-mac-control-border rounded-[5px] text-mac-selection-text font-mono">
            {currentBranch}
          </div>
        </div>

        <label className="flex items-center gap-2 text-[13px] text-mac-label cursor-pointer">
          <input
            type="checkbox"
            checked={noFastForward}
            onChange={(e) => setNoFastForward(e.target.checked)}
            className="accent-[var(--mac-accent)]"
          />
          No fast-forward (always create merge commit)
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => setShowMergeDialog(false)}
            className="px-3 py-1 text-[13px] text-mac-label bg-mac-control-bg border border-mac-control-border rounded-md hover:bg-mac-control-active transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={!sourceBranch}
            className="px-3 py-1 text-[13px] bg-mac-accent text-[#171717] font-medium rounded-md hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors disabled:opacity-35"
          >
            Merge
          </button>
        </div>
      </div>
    </Dialog>
  );
}
