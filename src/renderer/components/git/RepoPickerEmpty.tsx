import React from 'react';
import { useGitStore } from '../../stores/git-store';

export default function RepoPickerEmpty() {
  const { selectRepo, recentRepos, openRepo } = useGitStore();

  return (
    <div className="h-full flex flex-col bg-ghv-bg bg-grid">
      <div className="h-10 bg-ghv-surface border-b border-ghv-border flex items-center px-4 drag-region">
        <span className="text-xs text-ghv-text-dim font-mono tracking-wider uppercase">
          git manager
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div className="space-y-2">
            <svg className="w-12 h-12 mx-auto text-ghv-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3v12" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            <h2 className="text-ghv-text text-sm font-medium">No repository open</h2>
            <p className="text-ghv-text-muted text-xs">
              Select a local git repository to manage branches, merge, push, and stash.
            </p>
          </div>

          <button
            onClick={selectRepo}
            className="px-4 py-2 bg-ghv-accent/10 border border-ghv-accent/30 text-ghv-accent text-xs font-mono rounded hover:bg-ghv-accent/20 transition-colors"
          >
            Open Repository...
          </button>

          {recentRepos.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-ghv-text-muted text-2xs uppercase tracking-wider">Recent</p>
              <div className="space-y-1">
                {recentRepos.map((repo) => (
                  <button
                    key={repo.path}
                    onClick={() => openRepo(repo)}
                    className="w-full text-left px-3 py-1.5 text-xs text-ghv-text-dim hover:text-ghv-text hover:bg-ghv-surface rounded transition-colors group"
                  >
                    <span className="text-ghv-text group-hover:text-ghv-accent">{repo.name}</span>
                    <span className="block text-2xs text-ghv-text-muted truncate">{repo.path}</span>
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
