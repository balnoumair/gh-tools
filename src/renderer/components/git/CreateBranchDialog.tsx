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
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Branch name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="feature/my-branch"
            className="w-full px-2.5 py-1.5 text-[13px] bg-mac-fill/50 border border-mac-separator rounded-md text-mac-label placeholder:text-mac-label-tertiary focus:outline-none focus:ring-2 focus:ring-mac-primary/50 focus:border-mac-primary font-mono transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Start from (defaults to current: {currentBranch})</label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full px-2.5 py-1.5 text-[13px] bg-mac-fill/50 border border-mac-separator rounded-md text-mac-label focus:outline-none focus:ring-2 focus:ring-mac-primary/50 focus:border-mac-primary transition-colors"
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
            className="px-3 py-1.5 text-[13px] text-mac-label-secondary hover:text-mac-label transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-3 py-1.5 text-[13px] bg-mac-primary text-white rounded-md hover:bg-mac-primary-hover active:brightness-90 transition-colors disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </Dialog>
  );
}
