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
    <div className="h-[38px] border-b border-mac-separator-heavy bg-mac-bg-toolbar flex items-center pl-[78px] pr-3 gap-2.5 drag-region shrink-0">
      <span className="text-[13px] text-mac-label-secondary no-drag">
        Git Manager
      </span>
      <div className="w-px h-3.5 bg-mac-separator-heavy" />
      <div className="relative no-drag" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[13px] text-mac-label font-medium rounded hover:bg-mac-control-active active:bg-mac-separator transition-colors"
        >
          <span className="truncate max-w-[180px]">{activeRepo?.name ?? 'No repo'}</span>
          <svg className="w-[7px] h-[4px] text-mac-label-tertiary shrink-0 ml-0.5" viewBox="0 0 7 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0.5 0.5L3.5 3.5L6.5 0.5" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-[3px] w-56 bg-mac-bg-menu backdrop-blur-2xl border border-mac-separator-heavy rounded-md shadow-menu z-50 py-[3px] animate-menu-in">
            <MenuItem
              label="Open Repository..."
              accent
              onClick={() => { selectRepo(); setShowDropdown(false); }}
            />
            {recentRepos.length > 0 && (
              <>
                <div className="border-t border-mac-separator-heavy mx-2 my-[3px]" />
                <div className="max-h-48 overflow-y-auto">
                  {recentRepos.map((repo) => (
                    <MenuItem
                      key={repo.path}
                      label={repo.name}
                      sublabel={repo.path}
                      active={repo.path === activeRepo?.path}
                      onClick={() => { openRepo(repo); setShowDropdown(false); }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  label,
  sublabel,
  accent,
  active,
  onClick,
}: {
  label: string;
  sublabel?: string;
  accent?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-[calc(100%-6px)] mx-[3px] text-left px-2 py-[3px] text-[13px] rounded-[4px] transition-colors
        ${accent ? 'text-mac-accent' : active ? 'text-mac-selection-text' : 'text-mac-label'}
        hover:bg-mac-accent hover:text-white`}
    >
      <span className="block truncate">{label}</span>
      {sublabel && (
        <span className="block text-[11px] truncate opacity-50">{sublabel}</span>
      )}
    </button>
  );
}
