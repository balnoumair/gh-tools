import React, { useState, useRef, useEffect } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function GitTitleBar() {
  const { activeRepo, recentRepos, selectRepo, openRepo } = useGitStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <div className="h-10 bg-ghv-surface border-b border-ghv-border flex items-center px-4 gap-3 drag-region shrink-0">
      <span className="text-xs text-ghv-text-dim font-mono tracking-wider uppercase no-drag">
        git manager
      </span>
      <div className="w-px h-4 bg-ghv-border" />
      <div className="relative no-drag" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-ghv-text hover:text-ghv-accent transition-colors"
        >
          <span className="font-medium">{activeRepo?.name ?? 'No repo'}</span>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5l3 3 3-3" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-ghv-surface border border-ghv-border rounded shadow-lg z-50">
            <button
              onClick={() => { selectRepo(); setShowDropdown(false); }}
              className="w-full text-left px-3 py-2 text-xs text-ghv-accent hover:bg-ghv-accent/10 transition-colors border-b border-ghv-border"
            >
              Open Repository...
            </button>
            {recentRepos.length > 0 && (
              <div className="py-1 max-h-48 overflow-y-auto">
                {recentRepos.map((repo) => (
                  <button
                    key={repo.path}
                    onClick={() => { openRepo(repo); setShowDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-ghv-surface-hover transition-colors ${
                      repo.path === activeRepo?.path ? 'text-ghv-accent' : 'text-ghv-text-dim'
                    }`}
                  >
                    <span className="block">{repo.name}</span>
                    <span className="block text-2xs text-ghv-text-muted truncate">{repo.path}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
