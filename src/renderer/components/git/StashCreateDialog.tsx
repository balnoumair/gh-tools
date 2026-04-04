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
    <Dialog open={showStashCreateDialog} onClose={() => setShowStashCreateDialog(false)} title="Shelve (Stash) Changes">
      <div className="space-y-4">
        <div>
          <label className="block text-2xs text-ghv-text-muted mb-1">Message (optional)</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you're shelving..."
            className="w-full px-2 py-1.5 text-xs bg-ghv-bg border border-ghv-border rounded text-ghv-text placeholder:text-ghv-text-muted focus:outline-none focus:border-ghv-accent/50"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-ghv-text-dim cursor-pointer">
          <input
            type="checkbox"
            checked={includeUntracked}
            onChange={(e) => setIncludeUntracked(e.target.checked)}
            className="rounded border-ghv-border"
          />
          Include untracked files
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowStashCreateDialog(false)}
            className="px-3 py-1.5 text-xs text-ghv-text-dim hover:text-ghv-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 text-xs bg-ghv-accent/10 border border-ghv-accent/30 text-ghv-accent rounded hover:bg-ghv-accent/20 transition-colors"
          >
            Shelve
          </button>
        </div>
      </div>
    </Dialog>
  );
}
