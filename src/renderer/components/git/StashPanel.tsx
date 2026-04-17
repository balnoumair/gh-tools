import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function StashPanel() {
  const { repoStatus, stashApply, stashDrop, setShowStashCreateDialog } = useGitStore();
  const [open, setOpen] = useState(true);
  const stashes = repoStatus?.stashes ?? [];

  return (
    <div className="border-b border-mac-separator shrink-0">
      <div className="flex items-center pr-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] text-mac-label-tertiary font-medium uppercase tracking-[0.10em] hover:text-mac-label-secondary transition-colors"
        >
          <svg
            className={`w-[7px] h-[7px] transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
            viewBox="0 0 8 8"
            fill="currentColor"
          >
            <path d="M2 1l4 3-4 3z" />
          </svg>
          <span>Shelve / Stash</span>
          <span className="text-mac-label-quaternary text-[10px] tabular-nums normal-case tracking-normal font-mono">{stashes.length}</span>
        </button>
        <button
          onClick={() => setShowStashCreateDialog(true)}
          className="w-5 h-5 flex items-center justify-center rounded text-mac-label-tertiary hover:text-mac-accent hover:bg-mac-control-hover transition-colors"
          title="Create stash"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2v8M2 6h8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="max-h-40 overflow-y-auto pb-1">
          {stashes.length === 0 ? (
            <p className="px-3 py-1.5 text-[11.5px] text-mac-label-tertiary">No stashes</p>
          ) : (
            stashes.map((stash) => (
              <div
                key={stash.index}
                className="flex items-center gap-2 px-3 py-1 text-[12px] hover:bg-mac-control-hover transition-colors group"
              >
                <span className="text-mac-label-quaternary font-mono text-[10.5px] shrink-0">
                  @{'{' + stash.index + '}'}
                </span>
                <span className="text-mac-label truncate flex-1" title={stash.message}>
                  {stash.message}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => stashApply({ stashIndex: stash.index })}
                    className="text-[10.5px] text-mac-accent hover:text-mac-accent-hover px-1.5 py-0.5 rounded hover:bg-mac-accent-soft font-medium"
                    title="Apply"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => stashApply({ stashIndex: stash.index, drop: true })}
                    className="text-[10.5px] text-mac-green px-1.5 py-0.5 rounded hover:bg-white/5 font-medium"
                    title="Pop (apply + drop)"
                  >
                    Pop
                  </button>
                  <button
                    onClick={() => stashDrop(stash.index)}
                    className="text-[10.5px] text-mac-red px-1.5 py-0.5 rounded hover:bg-white/5 font-medium"
                    title="Drop"
                  >
                    Drop
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
