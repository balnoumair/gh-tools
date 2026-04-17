import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';
import Dialog from './Dialog';

export default function UpdateDialog() {
  const { showUpdateDialog, setShowUpdateDialog, repoStatus, pull } = useGitStore();
  const [strategy, setStrategy] = useState<'merge' | 'rebase'>('merge');
  const [remote, setRemote] = useState('origin');

  const currentBranch = repoStatus?.currentBranch ?? '';

  const remotes = Array.from(
    new Set(
      repoStatus?.branches
        .filter((b) => b.isRemote && b.remoteName)
        .map((b) => b.remoteName!) ?? [],
    ),
  );

  const handleUpdate = () => {
    pull({ strategy, remote, branch: currentBranch });
  };

  return (
    <Dialog open={showUpdateDialog} onClose={() => setShowUpdateDialog(false)} title="Update (Pull)">
      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Branch</label>
          <div className="px-[7px] py-[3px] text-[13px] bg-mac-control-bg border border-mac-control-border rounded-[5px] text-mac-selection-text font-mono">
            {currentBranch}
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Remote</label>
          <select
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
            className="mac-select w-full"
          >
            {remotes.length > 0
              ? remotes.map((r) => <option key={r} value={r}>{r}</option>)
              : <option value="origin">origin</option>
            }
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1.5">Update strategy</label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[13px] text-mac-label cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="merge"
                checked={strategy === 'merge'}
                onChange={() => setStrategy('merge')}
                className="accent-[var(--mac-accent)]"
              />
              Merge (preserves merge commits)
            </label>
            <label className="flex items-center gap-2 text-[13px] text-mac-label cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="rebase"
                checked={strategy === 'rebase'}
                onChange={() => setStrategy('rebase')}
                className="accent-[var(--mac-accent)]"
              />
              Rebase (linear history)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => setShowUpdateDialog(false)}
            className="px-3 py-1 text-[13px] text-mac-label bg-mac-control-bg border border-mac-control-border rounded-md hover:bg-mac-control-active transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-3 py-1 text-[13px] bg-mac-accent text-[#1A1816] font-medium rounded-md hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </Dialog>
  );
}
