import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGitStore } from '../../stores/git-store';

function branchFromStatus(pathValue: string): string {
  return pathValue.split(/[\\/]/).filter(Boolean).at(-1) ?? 'repo';
}

export default function RaycastLauncher() {
  const { recentRepos, openRepo, selectRepo } = useGitStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.electronAPI.setWindowSize(920, 580);
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return recentRepos;
    return recentRepos.filter((repo) =>
      `${repo.name} ${repo.path}`.toLowerCase().includes(needle),
    );
  }, [query, recentRepos]);

  return (
    <div className="h-full bg-mac-bg-sidebar flex flex-col">
      <div className="h-[40px] flex items-center justify-center drag-region shrink-0">
        <div className="flex items-center gap-2 text-[12px] text-mac-label-secondary">
          <span className="gh-mark w-3 h-3 text-mac-accent" aria-hidden />
          <span>Git Manager</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-8 pt-[92px]">
        <div className="w-full max-w-[540px] animate-fade-in">
          <div className="rounded-lg border border-mac-separator-heavy bg-mac-bg-content shadow-dialog overflow-hidden">
            <div className="h-[54px] flex items-center gap-3 px-4 border-b border-mac-separator">
              <svg className="w-4 h-4 text-mac-label-tertiary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M11 11l3 3" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && filtered[0]) openRepo(filtered[0]);
                }}
                placeholder="Search repositories"
                className="min-w-0 flex-1 bg-transparent outline-none text-[18px] text-mac-label placeholder:text-mac-label-tertiary"
              />
            </div>

            <div className="max-h-[310px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <button
                  type="button"
                  onClick={selectRepo}
                  className="w-full rounded-md px-3 py-3 text-left text-[13px] text-mac-label-secondary hover:bg-white/[0.045]"
                >
                  Browse for a repository...
                </button>
              ) : (
                filtered.slice(0, 8).map((repo) => (
                  <button
                    key={repo.path}
                    type="button"
                    onClick={() => openRepo(repo)}
                    className="group w-full rounded-md px-3 py-2.5 flex items-center gap-3 text-left hover:bg-white/[0.055] transition-colors"
                  >
                    <div className="h-8 w-8 rounded-md border border-mac-separator bg-white/[0.035] flex items-center justify-center shrink-0">
                      <span className="gh-mark w-4 h-4 text-mac-label-tertiary group-hover:text-mac-label" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] text-mac-label font-medium">{repo.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-mac-label-quaternary" />
                      </div>
                      <div className="mt-0.5 truncate text-[10.5px] text-mac-label-tertiary font-mono">
                        {repo.path}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10.5px] text-mac-label-secondary font-mono">
                        {branchFromStatus(repo.path)}
                      </div>
                      <div className="text-[10px] text-mac-label-quaternary">recent</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-mac-label-tertiary font-mono">
            <span>↵ open</span>
            <span>·</span>
            <button type="button" onClick={selectRepo} className="hover:text-mac-label">⌘⇧O browse...</button>
            <span>·</span>
            <span>⌘N clone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
