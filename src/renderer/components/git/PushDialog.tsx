import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';
import Dialog from './Dialog';

export default function PushDialog() {
  const { showPushDialog, setShowPushDialog, repoStatus, push } = useGitStore();
  const [remote, setRemote] = useState('origin');
  const [skipHooks, setSkipHooks] = useState(false);
  const [setUpstream, setSetUpstream] = useState(false);

  const currentBranch = repoStatus?.currentBranch ?? '';

  const handlePush = () => {
    push({
      branch: currentBranch,
      remote,
      skipPrePushHooks: skipHooks,
      setUpstream,
    });
    setSkipHooks(false);
    setSetUpstream(false);
  };

  // Get unique remote names from branches
  const remotes = Array.from(
    new Set(
      repoStatus?.branches
        .filter((b) => b.isRemote && b.remoteName)
        .map((b) => b.remoteName!) ?? [],
    ),
  );

  return (
    <Dialog open={showPushDialog} onClose={() => setShowPushDialog(false)} title="Push">
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

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-ghv-text-dim cursor-pointer">
            <input
              type="checkbox"
              checked={skipHooks}
              onChange={(e) => setSkipHooks(e.target.checked)}
              className="rounded border-ghv-border"
            />
            Skip pre-push hooks (--no-verify)
          </label>

          <label className="flex items-center gap-2 text-xs text-ghv-text-dim cursor-pointer">
            <input
              type="checkbox"
              checked={setUpstream}
              onChange={(e) => setSetUpstream(e.target.checked)}
              className="rounded border-ghv-border"
            />
            Set upstream tracking
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowPushDialog(false)}
            className="px-3 py-1.5 text-xs text-ghv-text-dim hover:text-ghv-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePush}
            className="px-3 py-1.5 text-xs bg-ghv-accent/10 border border-ghv-accent/30 text-ghv-accent rounded hover:bg-ghv-accent/20 transition-colors"
          >
            Push
          </button>
        </div>
      </div>
    </Dialog>
  );
}
