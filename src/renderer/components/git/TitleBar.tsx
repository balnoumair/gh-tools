import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGitStore } from '../../stores/git-store';

const MENU_WIDTH = 268;
const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;

interface MenuPosition {
  top: number;
  left: number;
  maxHeight: number;
}

export default function TitleBar() {
  const { activeRepo, recentRepos, selectRepo, openRepo, closeRepo } = useGitStore();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // The menu renders in a portal with fixed positioning so it can't be clipped
  // by the workspace's overflow-hidden containers. Anchor it under the trigger.
  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(centerX - MENU_WIDTH / 2, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN),
    );
    const top = rect.bottom + MENU_GAP;
    setPosition({ top, left, maxHeight: window.innerHeight - top - VIEWPORT_MARGIN });
  }, []);

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', reposition);
    };
  }, [open, reposition]);

  return (
    <div className="h-[40px] bg-mac-bg-toolbar flex items-center pl-[78px] pr-3 drag-region shrink-0">
      <div className="mx-auto no-drag">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="max-w-[260px] flex items-center gap-1.5 rounded-md pl-2 pr-1.5 py-1 hover:bg-white/[0.055] transition-colors"
        >
          <span className="gh-mark w-3 h-3 text-mac-label-secondary" aria-hidden />
          <span className="min-w-0 truncate text-[12px] text-mac-label-secondary">
            Pulse
          </span>
          <span className="text-[12px] text-mac-label-quaternary">›</span>
          <span className="min-w-0 truncate text-[12px] text-mac-label font-medium">
            {activeRepo?.name ?? 'No project'}
          </span>
          <ChevronDown
            className={`w-2.5 h-2.5 text-mac-label-tertiary transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && position &&
          createPortal(
            <div
              ref={menuRef}
              className="fixed z-[100] flex flex-col rounded-[10px] border border-mac-separator-heavy bg-mac-bg-popover shadow-menu p-1 animate-menu-in no-drag"
              style={{ top: position.top, left: position.left, width: MENU_WIDTH, maxHeight: position.maxHeight }}
            >
              <ActionItem
                label="Open repository…"
                icon={<FolderIcon />}
                onClick={() => { selectRepo(); setOpen(false); }}
              />
              {activeRepo && (
                <ActionItem
                  label="Close project"
                  icon={<LauncherIcon />}
                  onClick={() => { closeRepo(); setOpen(false); }}
                />
              )}

              {recentRepos.length > 0 && (
                <>
                  <div className="mt-1.5 mb-0.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-mac-label-tertiary">
                    Recent
                  </div>
                  <div className="min-h-0 overflow-y-auto">
                    {recentRepos.map((repo) => (
                      <RecentItem
                        key={repo.path}
                        name={repo.name}
                        path={repo.path}
                        active={repo.path === activeRepo?.path}
                        onClick={() => {
                          openRepo(repo);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}

function ActionItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] text-mac-label hover:bg-white/[0.06] transition-colors"
    >
      <span className="shrink-0 text-mac-label-secondary">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function RecentItem({
  name,
  path,
  active,
  onClick,
}: {
  name: string;
  path: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 text-left transition-colors ${
        active ? 'bg-white/[0.05]' : 'hover:bg-white/[0.055]'
      }`}
    >
      <span className="h-7 w-7 shrink-0 rounded-md border border-mac-separator bg-white/[0.035] flex items-center justify-center">
        <span className="gh-mark w-3.5 h-3.5 text-mac-label-tertiary group-hover:text-mac-label-secondary" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-medium text-mac-label">{name}</span>
        <span className="block truncate font-mono text-[10px] text-mac-label-tertiary">{path}</span>
      </span>
      {active ? (
        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-mac-label-secondary" />
      ) : (
        <ChevronRight className="shrink-0 w-3 h-3 text-mac-label-quaternary group-hover:text-mac-label-tertiary" />
      )}
    </button>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M2 4.5a1 1 0 0 1 1-1h3l1.2 1.4H13a1 1 0 0 1 1 1v5.6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LauncherIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </svg>
  );
}
