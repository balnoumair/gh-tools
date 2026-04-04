import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';
import Dialog from './Dialog';

export default function CreateBranchDialog() {
  const { showCreateBranchDialog, setShowCreateBranchDialog, repoStatus, createBranch } = useGitStore();
  const [name, setName] = useState('');
  const [startPoint, setStartPoint] = useState('');

  const localBranches = repoStatus?.branches.filter((b) => !b.isRemote) ?? [];
  const currentBranch = repoStatus?.currentBranch ?? '';

  const handleCreate = () => {
    if (!name.trim()) return;
    createBranch(name.trim(), startPoint || undefined);
    setName('');
    setStartPoint('');
  };

  return (
    <Dialog open={showCreateBranchDialog} onClose={() => setShowCreateBranchDialog(false)} title="New Branch">
      <div className="space-y-4">
        <div>
          <label className="block text-2xs text-ghv-text-muted mb-1">Branch name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="feature/my-branch"
            className="w-full px-2 py-1.5 text-xs bg-ghv-bg border border-ghv-border rounded text-ghv-text placeholder:text-ghv-text-muted focus:outline-none focus:border-ghv-accent/50 font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-2xs text-ghv-text-muted mb-1">Start from (defaults to current: {currentBranch})</label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-ghv-bg border border-ghv-border rounded text-ghv-text focus:outline-none focus:border-ghv-accent/50"
          >
            <option value="">Current branch ({currentBranch})</option>
            {localBranches.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowCreateBranchDialog(false)}
            className="px-3 py-1.5 text-xs text-ghv-text-dim hover:text-ghv-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-xs bg-ghv-accent/10 border border-ghv-accent/30 text-ghv-accent rounded hover:bg-ghv-accent/20 transition-colors disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </Dialog>
  );
}
