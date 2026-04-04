import React, { useState, useMemo } from 'react';
import { useGitStore } from '../../stores/git-store';
import BranchGroup from './BranchGroup';
import BranchItem from './BranchItem';
import type { GitBranch } from '@shared/types';

export default function BranchPanel() {
  const { repoStatus } = useGitStore();
  const [filter, setFilter] = useState('');

  const { local, remoteGroups } = useMemo(() => {
    if (!repoStatus) return { local: [], remoteGroups: new Map<string, GitBranch[]>() };

    const lc = filter.toLowerCase();
    const filtered = repoStatus.branches.filter((b) =>
      lc ? b.name.toLowerCase().includes(lc) : true,
    );

    const local = filtered.filter((b) => !b.isRemote);
    const remoteGroups = new Map<string, GitBranch[]>();

    for (const b of filtered.filter((b) => b.isRemote)) {
      const remote = b.remoteName ?? 'unknown';
      if (!remoteGroups.has(remote)) remoteGroups.set(remote, []);
      remoteGroups.get(remote)!.push(b);
    }

    return { local, remoteGroups };
  }, [repoStatus, filter]);

  return (
    <div className="w-[280px] border-r border-ghv-border flex flex-col shrink-0 bg-ghv-bg">
      {/* Search */}
      <div className="p-2 border-b border-ghv-border">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter branches..."
          className="w-full px-2 py-1 text-xs bg-ghv-surface border border-ghv-border rounded text-ghv-text placeholder:text-ghv-text-muted focus:outline-none focus:border-ghv-accent/50"
        />
      </div>

      {/* Branch tree */}
      <div className="flex-1 overflow-y-auto py-1">
        <BranchGroup label="Local Branches" count={local.length} defaultOpen>
          {local.map((b) => (
            <BranchItem key={b.name} branch={b} />
          ))}
        </BranchGroup>

        {Array.from(remoteGroups.entries()).map(([remote, branches]) => (
          <BranchGroup key={remote} label={remote} count={branches.length}>
            {branches.map((b) => (
              <BranchItem key={b.name} branch={b} />
            ))}
          </BranchGroup>
        ))}
      </div>
    </div>
  );
}
