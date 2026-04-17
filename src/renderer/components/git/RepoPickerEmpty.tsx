import React from 'react';
import { useGitStore } from '../../stores/git-store';

function getGreetingName(): string {
  // Try environment-style hints, fall back to a friendly default.
  // (Renderer doesn't have direct env access; keep it generic.)
  return 'there';
}

export default function RepoPickerEmpty() {
  const { selectRepo, recentRepos, openRepo } = useGitStore();
  const name = getGreetingName();

  return (
    <div className="h-full flex flex-col bg-app-canvas">
      {/* Title bar (drag region only — no chrome label) */}
      <div className="h-[38px] flex items-center pl-[78px] pr-3 drag-region shrink-0">
        <div className="flex items-center gap-2 no-drag">
          <span className="gh-mark text-mac-accent w-[12px] h-[12px]" aria-hidden />
          <span className="text-[12px] text-mac-label-secondary tracking-tight">
            Git Manager
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 pb-16">
        <div className="w-full max-w-[440px] flex flex-col items-center text-center animate-fade-in">
          <span className="gh-mark text-mac-accent w-7 h-7 mb-5 animate-spark" aria-hidden />

          <h1 className="font-display italic text-[36px] leading-[1.05] text-mac-label tracking-tight">
            What's up next, {name}?
          </h1>
          <p className="text-[13px] text-mac-label-tertiary mt-2 mb-8">
            Open a repository to start managing branches.
          </p>

          <button
            onClick={selectRepo}
            className="group relative px-5 py-2.5 rounded-full
                       bg-mac-accent text-[#171717] text-[13px] font-medium
                       hover:bg-mac-accent-hover active:bg-mac-accent-active
                       transition-all
                       shadow-[0_1px_0_rgba(255,255,255,0.10)_inset,0_8px_24px_-8px_rgba(0,0,0,0.60)]"
          >
            <span className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4a1 1 0 0 1 1-1h3.5l1.5 2H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              Open repository…
            </span>
          </button>

          {recentRepos.length > 0 && (
            <div className="w-full mt-12">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-[10.5px] uppercase tracking-[0.10em] text-mac-label-tertiary font-medium">
                  Recents
                </span>
                <div className="flex-1 h-px bg-mac-separator" />
              </div>
              <div className="card divide-y divide-mac-separator overflow-hidden text-left">
                {recentRepos.slice(0, 6).map((repo) => (
                  <button
                    key={repo.path}
                    onClick={() => openRepo(repo)}
                    className="w-full px-3.5 py-2.5 flex items-center gap-3
                               hover:bg-mac-control-hover transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-md bg-mac-bg-card-soft border border-mac-separator flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-mac-label-tertiary group-hover:text-mac-accent transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M5 3v10M5 7h4a2 2 0 0 1 2 2v4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-mac-label truncate tracking-tight">
                        {repo.name}
                      </div>
                      <div className="text-[10.5px] text-mac-label-tertiary truncate font-mono">
                        {repo.path}
                      </div>
                    </div>
                    <svg className="w-3 h-3 text-mac-label-quaternary group-hover:text-mac-accent transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
