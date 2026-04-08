import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function StashPanel() {
  const { repoStatus, stashApply, stashDrop, setShowStashCreateDialog } = useGitStore();
  const [open, setOpen] = useState(true);
  const stashes = repoStatus?.stashes ?? [];

  return (
    <div className="border-b border-mac-separator-heavy shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1 px-3 py-[3px] text-[11px] text-mac-label-secondary font-semibold uppercase tracking-wide hover:bg-mac-control-active transition-colors"
      >
        <svg
          className={`w-[8px] h-[8px] text-mac-label-tertiary transition-transform duration-100 ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <path d="M2 1l4 3-4 3z" />
        </svg>
        <span className="ml-0.5">Shelve / Stash</span>
        <span className="text-mac-label-quaternary ml-auto text-[10px] tabular-nums">{stashes.length}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setShowStashCreateDialog(true); }}
          className="ml-1 text-mac-label-tertiary hover:text-mac-accent transition-colors"
          title="Create stash"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2v8M2 6h8" />
          </svg>
        </button>
      </button>

      {open && (
        <div className="max-h-40 overflow-y-auto">
          {stashes.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-mac-label-tertiary">No stashes</p>
          ) : (
            stashes.map((stash) => (
              <div
                key={stash.index}
                className="flex items-center gap-2 px-3 py-1 text-[12px] hover:bg-mac-control-active transition-colors group"
              >
                <span className="text-mac-label-tertiary font-mono text-[11px] shrink-0">
                  @{'{' + stash.index + '}'}
                </span>
                <span className="text-mac-label truncate flex-1" title={stash.message}>
                  {stash.message}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => stashApply({ stashIndex: stash.index })}
                    className="text-[11px] text-mac-accent hover:text-mac-accent-hover px-1 font-medium"
                    title="Apply"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => stashApply({ stashIndex: stash.index, drop: true })}
                    className="text-[11px] text-mac-green px-1 font-medium"
                    title="Pop (apply + drop)"
                  >
                    Pop
                  </button>
                  <button
                    onClick={() => stashDrop(stash.index)}
                    className="text-[11px] text-mac-red px-1 font-medium"
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
