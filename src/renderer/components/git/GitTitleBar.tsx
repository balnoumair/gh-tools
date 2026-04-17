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
    <div className="h-[40px] bg-mac-bg-toolbar flex items-center pl-[78px] pr-3 gap-3 drag-region shrink-0">
      <div className="flex items-center gap-2 no-drag">
        <span className="gh-mark text-mac-accent w-[12px] h-[12px]" aria-hidden />
        <span className="text-[12px] text-mac-label-secondary tracking-tight">
          Git Manager
        </span>
      </div>

      <div className="w-px h-3.5 bg-mac-separator-heavy" />

      <div className="relative no-drag" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-[3px] text-[12.5px] text-mac-label font-medium rounded-md hover:bg-mac-control-hover active:bg-mac-control-active transition-colors tracking-tight"
        >
          <svg className="w-[11px] h-[11px] text-mac-label-tertiary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M5 3v10M5 7h4a2 2 0 0 1 2 2v4" />
          </svg>
          <span className="truncate max-w-[200px]">{activeRepo?.name ?? 'No repo'}</span>
          <svg className="w-[7px] h-[4px] text-mac-label-tertiary shrink-0 ml-0.5" viewBox="0 0 7 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0.5 0.5L3.5 3.5L6.5 0.5" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-mac-bg-menu backdrop-blur-2xl border border-mac-separator-heavy rounded-lg shadow-menu z-50 py-1 animate-menu-in">
            <MenuItem
              label="Open repository…"
              accent
              onClick={() => { selectRepo(); setShowDropdown(false); }}
            />
            {recentRepos.length > 0 && (
              <>
                <div className="border-t border-mac-separator mx-2 my-1" />
                <div className="max-h-56 overflow-y-auto">
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
      className={`w-[calc(100%-8px)] mx-1 text-left px-2.5 py-1.5 text-[12.5px] rounded-md transition-colors
        ${accent ? 'text-mac-accent' : active ? 'text-mac-accent' : 'text-mac-label'}
        hover:bg-mac-accent hover:text-[#1A1816]`}
    >
      <span className="block truncate tracking-tight">{label}</span>
      {sublabel && (
        <span className="block text-[10.5px] truncate opacity-60 font-mono">{sublabel}</span>
      )}
    </button>
  );
}
