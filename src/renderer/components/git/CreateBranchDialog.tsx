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
      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Branch name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="feature/my-branch"
            className="mac-input w-full font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Start from (defaults to current: {currentBranch})</label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="mac-select w-full"
          >
            <option value="">Current branch ({currentBranch})</option>
            {localBranches.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => setShowCreateBranchDialog(false)}
            className="px-3 py-1 text-[13px] text-mac-label bg-mac-control-bg border border-mac-control-border rounded-md hover:bg-mac-control-active transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-3 py-1 text-[13px] bg-mac-accent text-[#171717] font-medium rounded-md hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors disabled:opacity-35"
          >
            Create
          </button>
        </div>
      </div>
    </Dialog>
  );
}
