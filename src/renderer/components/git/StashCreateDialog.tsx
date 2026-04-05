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
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] text-mac-label-tertiary mb-1">Message (optional)</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="WIP: description..."
            className="w-full px-2.5 py-1.5 text-[13px] bg-mac-fill/50 border border-mac-separator rounded-md text-mac-label placeholder:text-mac-label-tertiary focus:outline-none focus:ring-2 focus:ring-mac-primary/50 focus:border-mac-primary transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-mac-label-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={includeUntracked}
            onChange={(e) => setIncludeUntracked(e.target.checked)}
            className="rounded border-mac-separator"
          />
          Include untracked files
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowStashCreateDialog(false)}
            className="px-3 py-1.5 text-[13px] text-mac-label-secondary hover:text-mac-label transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 text-[13px] bg-mac-primary text-white rounded-md hover:bg-mac-primary-hover active:brightness-90 transition-colors"
          >
            Shelve
          </button>
        </div>
      </div>
    </Dialog>
  );
}
