import React, { useEffect, useRef, useState } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function TitleBar() {
  const { activeRepo, recentRepos, selectRepo, openRepo, closeRepo } = useGitStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="h-[40px] bg-mac-bg-toolbar flex items-center pl-[78px] pr-3 drag-region shrink-0">
      <div className="relative mx-auto no-drag" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="max-w-[260px] flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-white/[0.055] transition-colors"
        >
          <span className="gh-mark w-3 h-3 text-mac-label-secondary" aria-hidden />
          <span className="min-w-0 truncate text-[12px] text-mac-label-secondary">
            Git Manager
          </span>
          <span className="text-[12px] text-mac-label-quaternary">/</span>
          <span className="min-w-0 truncate text-[12px] text-mac-label font-medium">
            {activeRepo?.name ?? 'Launcher'}
          </span>
        </button>

        {open && (
          <div className="absolute left-1/2 top-full z-50 mt-1.5 w-64 -translate-x-1/2 rounded-lg border border-mac-separator-heavy bg-mac-bg-menu shadow-menu py-1 animate-menu-in">
            <MenuItem label="Open repository..." accent onClick={() => { selectRepo(); setOpen(false); }} />
            <MenuItem label="Back to launcher" onClick={() => { closeRepo(); setOpen(false); }} />
            {recentRepos.length > 0 && <div className="my-1 mx-2 border-t border-mac-separator" />}
            {recentRepos.map((repo) => (
              <MenuItem
                key={repo.path}
                label={repo.name}
                sublabel={repo.path}
                active={repo.path === activeRepo?.path}
                onClick={() => {
                  openRepo(repo);
                  setOpen(false);
                }}
              />
            ))}
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
      type="button"
      onClick={onClick}
      className={`w-[calc(100%-8px)] mx-1 rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors ${
        accent || active ? 'text-mac-accent' : 'text-mac-label'
      } hover:bg-mac-accent hover:text-[#171717]`}
    >
      <span className="block truncate">{label}</span>
      {sublabel && <span className="block truncate font-mono text-[10px] opacity-60">{sublabel}</span>}
    </button>
  );
}
