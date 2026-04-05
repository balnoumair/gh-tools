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
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Branch</label>
          <div className="px-2.5 py-1.5 text-[13px] bg-mac-fill/30 border border-mac-separator rounded-md text-mac-primary font-mono">
            {currentBranch}
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Remote</label>
          <select
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[13px] bg-mac-fill/50 border border-mac-separator rounded-md text-mac-label focus:outline-none focus:ring-2 focus:ring-mac-primary/50 focus:border-mac-primary transition-colors"
          >
            {remotes.length > 0
              ? remotes.map((r) => <option key={r} value={r}>{r}</option>)
              : <option value="origin">origin</option>
            }
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-tertiary mb-2">Update strategy</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] text-mac-label-secondary cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="merge"
                checked={strategy === 'merge'}
                onChange={() => setStrategy('merge')}
                className="border-mac-separator"
              />
              Merge (preserves merge commits)
            </label>
            <label className="flex items-center gap-2 text-[13px] text-mac-label-secondary cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="rebase"
                checked={strategy === 'rebase'}
                onChange={() => setStrategy('rebase')}
                className="border-mac-separator"
              />
              Rebase (linear history)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowUpdateDialog(false)}
            className="px-3 py-1.5 text-[13px] text-mac-label-secondary hover:text-mac-label transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-3 py-1.5 text-[13px] bg-mac-primary text-white rounded-md hover:bg-mac-primary-hover active:brightness-90 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </Dialog>
  );
}
