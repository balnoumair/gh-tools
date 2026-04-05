import React, { useState } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function StashPanel() {
  const { repoStatus, stashApply, stashDrop, setShowStashCreateDialog } = useGitStore();
  const [open, setOpen] = useState(true);
  const stashes = repoStatus?.stashes ?? [];

  return (
    <div className="border-b border-mac-separator shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-mac-label-tertiary uppercase tracking-wider hover:bg-mac-fill/50 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
        <span>Shelve / Stash</span>
        <span className="text-mac-label-tertiary/60 ml-auto">{stashes.length}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setShowStashCreateDialog(true); }}
          className="ml-1 text-mac-label-tertiary hover:text-mac-primary transition-colors"
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
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-mac-fill/50 transition-colors group"
              >
                <span className="text-mac-label-tertiary font-mono text-[11px] shrink-0">
                  @{'{' + stash.index + '}'}
                </span>
                <span className="text-mac-label-secondary truncate flex-1" title={stash.message}>
                  {stash.message}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => stashApply({ stashIndex: stash.index })}
                    className="text-[11px] text-mac-primary hover:text-mac-primary/80 px-1"
                    title="Apply"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => stashApply({ stashIndex: stash.index, drop: true })}
                    className="text-[11px] text-mac-success hover:text-mac-success/80 px-1"
                    title="Pop (apply + drop)"
                  >
                    Pop
                  </button>
                  <button
                    onClick={() => stashDrop(stash.index)}
                    className="text-[11px] text-mac-danger hover:text-mac-danger/80 px-1"
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
