import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';
import Dialog from './Dialog';

export default function StashCreateDialog() {
  const { showStashCreateDialog, setShowStashCreateDialog, stashCreate } = useGitStore();
  const [message, setMessage] = useState('');
  const [includeUntracked, setIncludeUntracked] = useState(false);

  const handleCreate = () => {
    stashCreate({ message: message || undefined, includeUntracked });
    setMessage('');
    setIncludeUntracked(false);
  };

  return (
    <Dialog open={showStashCreateDialog} onClose={() => setShowStashCreateDialog(false)} title="Shelve (Stash)">
      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] text-mac-label-secondary mb-1">Message (optional)</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="WIP: description..."
            className="mac-input w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-mac-label cursor-pointer">
          <input
            type="checkbox"
            checked={includeUntracked}
            onChange={(e) => setIncludeUntracked(e.target.checked)}
            className="accent-[var(--mac-accent)]"
          />
          Include untracked files
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => setShowStashCreateDialog(false)}
            className="px-3 py-1 text-[13px] text-mac-label bg-mac-control-bg border border-mac-control-border rounded-md hover:bg-mac-control-active transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-3 py-1 text-[13px] bg-mac-accent text-white font-medium rounded-md hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors"
          >
            Shelve
          </button>
        </div>
      </div>
    </Dialog>
  );
}
