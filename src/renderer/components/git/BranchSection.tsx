import React, { useMemo } from 'react';
import { useGitStore } from '../../stores/git-store';
import SectionHeader from './SectionHeader';

interface Props {
  kind: 'local' | 'remote';
}

export default function BranchSection({ kind }: Props) {
  const { repoStatus, checkoutBranch } = useGitStore();
  const branches = useMemo(() => {
    const all = repoStatus?.branches ?? [];
    return all.filter((branch) => (kind === 'remote' ? branch.isRemote : !branch.isRemote));
  }, [kind, repoStatus]);

  return (
    <SectionHeader
      id={kind === 'local' ? 'local-branches' : 'remote-branches'}
      title={kind === 'local' ? 'Local' : 'Remote'}
      count={branches.length}
      defaultOpen={kind === 'local'}
    >
      {(open) => (
        open && (
          <div className="pb-1">
            {branches.length === 0 ? (
              <p className="px-3 pb-2 text-[11.5px] text-mac-label-tertiary">No branches</p>
            ) : (
              branches.map((branch) => (
                <button
                  type="button"
                  key={branch.name}
                  onDoubleClick={() => !branch.current && checkoutBranch(branch.name)}
                  className={`mx-2 mb-1 w-[calc(100%-16px)] rounded-md px-2.5 py-1.5 flex items-center gap-2 text-left transition-colors ${
                    branch.current
                      ? 'bg-mac-selection text-mac-selection-text'
                      : 'text-mac-label hover:bg-white/[0.045]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${branch.current ? 'bg-white' : 'bg-mac-label-quaternary'}`} />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-mono">
                    {branch.isRemote ? branch.name.split('/').slice(1).join('/') : branch.name}
                  </span>
                  {(branch.ahead > 0 || branch.behind > 0) && (
                    <span className="text-[10px] text-mac-label-tertiary font-mono tabular-nums">
                      {branch.ahead > 0 ? `↑${branch.ahead}` : ''}
                      {branch.ahead > 0 && branch.behind > 0 ? ' ' : ''}
                      {branch.behind > 0 ? `↓${branch.behind}` : ''}
                    </span>
                  )}
                  <span className="text-[10px] text-mac-label-quaternary font-mono">
                    {branch.commitHash}
                  </span>
                </button>
              ))
            )}
          </div>
        )
      )}
    </SectionHeader>
  );
}
