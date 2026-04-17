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

  const remotes = Array.from(
    new Set(
      repoStatus?.branches
        .filter((b) => b.isRemote && b.remoteName)
        .map((b) => b.remoteName!) ?? [],
    ),
  );

  return (
    <Dialog open={showPushDialog} onClose={() => setShowPushDialog(false)} title="Push">
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

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[13px] text-mac-label cursor-pointer">
            <input
              type="checkbox"
              checked={skipHooks}
              onChange={(e) => setSkipHooks(e.target.checked)}
              className="accent-[var(--mac-accent)]"
            />
            Skip pre-push hooks (--no-verify)
          </label>

          <label className="flex items-center gap-2 text-[13px] text-mac-label cursor-pointer">
            <input
              type="checkbox"
              checked={setUpstream}
              onChange={(e) => setSetUpstream(e.target.checked)}
              className="accent-[var(--mac-accent)]"
            />
            Set upstream tracking
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => setShowPushDialog(false)}
            className="px-3 py-1 text-[13px] text-mac-label bg-mac-control-bg border border-mac-control-border rounded-md hover:bg-mac-control-active transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePush}
            className="px-3 py-1 text-[13px] bg-mac-accent text-[#1A1816] font-medium rounded-md hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors"
          >
            Push
          </button>
        </div>
      </div>
    </Dialog>
  );
}
