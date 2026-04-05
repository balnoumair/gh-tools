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
    <div className="h-10 border-b border-mac-separator flex items-center pl-[96px] pr-4 gap-3 drag-region shrink-0">
      <span className="text-[13px] text-mac-label-secondary font-medium no-drag">
        Git Manager
      </span>
      <div className="w-px h-4 bg-mac-separator" />
      <div className="relative no-drag" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1.5 text-[13px] text-mac-label hover:text-mac-primary transition-colors"
        >
          <span className="font-medium">{activeRepo?.name ?? 'No repo'}</span>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5l3 3 3-3" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-mac-fill-secondary/80 backdrop-blur-xl border border-mac-separator rounded-lg shadow-lg z-50">
            <button
              onClick={() => { selectRepo(); setShowDropdown(false); }}
              className="w-full text-left px-3 py-2 text-[13px] text-mac-primary hover:bg-mac-fill/50 transition-colors border-b border-mac-separator rounded-t-lg"
            >
              Open Repository...
            </button>
            {recentRepos.length > 0 && (
              <div className="py-1 max-h-48 overflow-y-auto">
                {recentRepos.map((repo) => (
                  <button
                    key={repo.path}
                    onClick={() => { openRepo(repo); setShowDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-mac-fill/50 transition-colors ${
                      repo.path === activeRepo?.path ? 'text-mac-primary' : 'text-mac-label-secondary'
                    }`}
                  >
                    <span className="block">{repo.name}</span>
                    <span className="block text-[11px] text-mac-label-tertiary truncate">{repo.path}</span>
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
