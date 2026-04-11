import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function RepoPickerEmpty() {
  const { selectRepo, recentRepos, openRepo } = useGitStore();

  return (
    <div className="h-full flex flex-col bg-mac-bg-window">
      <div className="h-[38px] border-b border-mac-separator-heavy bg-mac-bg-toolbar flex items-center pl-[78px] pr-3 drag-region">
        <span className="text-[13px] text-mac-label-secondary">
          Git Manager
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-mac-bg-content">
        <div className="text-center space-y-5 max-w-xs">
          <div className="space-y-2">
            <svg className="w-10 h-10 mx-auto text-mac-label-quaternary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3v12" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <h2 className="text-mac-label text-[14px] font-semibold">No repository open</h2>
            <p className="text-mac-label-secondary text-[12px] leading-relaxed">
              Select a local git repository to manage branches, merge, push, and stash.
            </p>
          </div>

          <button
            onClick={selectRepo}
            className="px-4 py-1.5 bg-mac-accent text-white text-[13px] font-medium rounded-md hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors"
          >
            Open Repository...
          </button>

          {recentRepos.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-mac-label-tertiary text-[11px] font-semibold uppercase tracking-wide">Recent</p>
              <div className="space-y-px">
                {recentRepos.map((repo) => (
                  <button
                    key={repo.path}
                    onClick={() => openRepo(repo)}
                    className="w-full text-left px-2.5 py-1 text-[12px] text-mac-label hover:bg-mac-control-active rounded transition-colors group"
                  >
                    <span className="text-mac-label group-hover:text-mac-selection-text transition-colors">{repo.name}</span>
                    <span className="block text-[10px] text-mac-label-tertiary truncate">{repo.path}</span>
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
