import React from 'react';
import { useGitStore } from '../../stores/git-store';
import SectionHeader from './SectionHeader';

export default function StashSection() {
  const { repoStatus, stashApply, stashDrop, setShowStashCreateDialog } = useGitStore();
  const stashes = repoStatus?.stashes ?? [];

  return (
    <SectionHeader
      id="stash"
      title="Stash"
      count={stashes.length}
      action={
        <button
          type="button"
          title="Create stash"
          onClick={() => setShowStashCreateDialog(true)}
          className="h-5 w-5 rounded text-mac-label-tertiary hover:text-mac-label hover:bg-white/5"
        >
          +
        </button>
      }
    >
      {(open) => (
        open && (
          <div className="pb-1">
            {stashes.length === 0 ? (
              <p className="px-3 pb-2 text-[11.5px] text-mac-label-tertiary">No stashes</p>
            ) : (
              stashes.map((stash) => (
                <div
                  key={stash.index}
                  className="group mx-2 mb-1 rounded-md px-2.5 py-1.5 flex items-center gap-2 hover:bg-white/[0.045]"
                >
                  <span className="text-[10.5px] text-mac-label-quaternary font-mono shrink-0">
                    @{`{${stash.index}}`}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-mac-label" title={stash.message}>
                    {stash.message}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RowAction label="Apply" onClick={() => stashApply({ stashIndex: stash.index })} />
                    <RowAction label="Pop" onClick={() => stashApply({ stashIndex: stash.index, drop: true })} />
                    <RowAction label="Drop" danger onClick={() => stashDrop(stash.index)} />
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}
    </SectionHeader>
  );
}

function RowAction({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded text-[10.5px] font-medium ${
        danger ? 'text-mac-red' : 'text-mac-label-secondary'
      } hover:bg-white/10 hover:text-mac-label`}
    >
      {label}
    </button>
  );
}
