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
          <label className="block text-2xs text-ghv-text-muted mb-1">Branch</label>
          <div className="px-2 py-1.5 text-xs bg-ghv-bg/50 border border-ghv-border rounded text-ghv-accent font-mono">
            {currentBranch}
          </div>
        </div>

        <div>
          <label className="block text-2xs text-ghv-text-muted mb-1">Remote</label>
          <select
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-ghv-bg border border-ghv-border rounded text-ghv-text focus:outline-none focus:border-ghv-accent/50"
          >
            {remotes.length > 0
              ? remotes.map((r) => <option key={r} value={r}>{r}</option>)
              : <option value="origin">origin</option>
            }
          </select>
        </div>

        <div>
          <label className="block text-2xs text-ghv-text-muted mb-2">Update strategy</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-ghv-text-dim cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="merge"
                checked={strategy === 'merge'}
                onChange={() => setStrategy('merge')}
                className="border-ghv-border"
              />
              Merge (preserves merge commits)
            </label>
            <label className="flex items-center gap-2 text-xs text-ghv-text-dim cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="rebase"
                checked={strategy === 'rebase'}
                onChange={() => setStrategy('rebase')}
                className="border-ghv-border"
              />
              Rebase (linear history)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowUpdateDialog(false)}
            className="px-3 py-1.5 text-xs text-ghv-text-dim hover:text-ghv-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-3 py-1.5 text-xs bg-ghv-accent/10 border border-ghv-accent/30 text-ghv-accent rounded hover:bg-ghv-accent/20 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </Dialog>
  );
}
