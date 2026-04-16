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
    <div className="w-[244px] bg-mac-bg-sidebar border-r border-mac-separator flex flex-col shrink-0">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-mac-label-tertiary pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter branches"
            className="mac-input w-full pl-7 text-[12px]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-2">
        <BranchGroup label="Local" count={local.length} defaultOpen>
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
