import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function RepoPickerEmpty() {
  const { selectRepo, recentRepos, openRepo } = useGitStore();

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 border-b border-mac-separator flex items-center pl-[96px] pr-4 drag-region">
        <span className="text-[13px] text-mac-label-secondary font-medium">
          Git Manager
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div className="space-y-2">
            <svg className="w-12 h-12 mx-auto text-mac-label-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3v12" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <h2 className="text-mac-label text-[15px] font-medium">No repository open</h2>
            <p className="text-mac-label-tertiary text-[13px]">
              Select a local git repository to manage branches, merge, push, and stash.
            </p>
          </div>

          <button
            onClick={selectRepo}
            className="px-4 py-2 bg-mac-primary text-white text-[13px] font-medium rounded-lg hover:bg-mac-primary-hover active:brightness-90 transition-colors"
          >
            Open Repository...
          </button>

          {recentRepos.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-mac-label-tertiary text-[11px] uppercase tracking-wider">Recent</p>
              <div className="space-y-1">
                {recentRepos.map((repo) => (
                  <button
                    key={repo.path}
                    onClick={() => openRepo(repo)}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-mac-label-secondary hover:text-mac-label hover:bg-mac-fill/50 rounded-md transition-colors group"
                  >
                    <span className="text-mac-label group-hover:text-mac-primary">{repo.name}</span>
                    <span className="block text-[11px] text-mac-label-tertiary truncate">{repo.path}</span>
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
