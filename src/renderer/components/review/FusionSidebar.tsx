import React, { useEffect, useState } from 'react';
import type { PullRequest, GitWorktree } from '@shared/types';
import { useSettingsPatch } from '../../hooks/use-settings-patch';

export interface RootItem {
  name: string;
  path: string;
  dirty: boolean;
  worktrees: GitWorktree[];
  prs: PullRequest[];
  loading?: boolean;
}

export type ViewState =
  | { type: 'pr'; prId: number }
  | { type: 'wt'; repoPath: string; worktreePath: string }
  | { type: 'settings' };

function ciDotClass(ciStatus: PullRequest['ciStatus']): string {
  if (ciStatus === 'success') return '#6fcf97';
  if (ciStatus === 'failure') return '#e98b8b';
  if (ciStatus === 'pending') return '#d9c98a';
  return 'rgba(255,255,255,0.25)';
}

const PR_STATE_COLOR: Record<PullRequest['mentionType'], string> = {
  review_requested: '#8fa6e6',
  authored: 'rgba(255,255,255,0.55)',
  mentioned: '#d9c98a',
  assigned: 'rgba(255,255,255,0.55)',
};

function WtRow({
  w, active, onClick,
}: { w: GitWorktree; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
        minHeight: 58, boxSizing: 'border-box',
        margin: '1px 8px', padding: '8px 9px', borderRadius: 9,
        background: active ? 'rgba(139,143,240,0.15)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(139,143,240,0.40)' : 'none',
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#8b8ff0' : 'rgba(255,255,255,0.3)'}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12,
            color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)', fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{w.branch}</span>
          {w.primary && (
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 9,
              padding: '1px 5px', borderRadius: 5,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, flexShrink: 0,
            }}>main</span>
          )}
        </div>
        <div style={{
          marginTop: 2, display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10.5, color: 'rgba(255,255,255,0.3)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: w.dirty ? '#d9c98a' : '#6fcf97',
            }} />
            {w.dirty ? 'modified' : 'clean'}
          </span>
          <span>↑{w.ahead} ↓{w.behind}</span>
        </div>
      </div>
    </div>
  );
}

function PRRow({
  pr, active, onClick,
}: { pr: PullRequest; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
        minHeight: 58, boxSizing: 'border-box',
        margin: '1px 8px', padding: '8px 9px', borderRadius: 9,
        background: active ? 'rgba(139,143,240,0.15)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(139,143,240,0.40)' : 'none',
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: ciDotClass(pr.ciStatus), flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11,
            color: 'rgba(255,255,255,0.3)', flexShrink: 0,
          }}>#{pr.number}</span>
          <span style={{
            fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 12.5,
            color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)',
            fontWeight: active ? 600 : 500, lineHeight: 1.32,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{pr.title}</span>
        </div>
        <div style={{
          marginTop: 3, display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10.5, color: 'rgba(255,255,255,0.3)',
        }}>
          <span style={{ color: PR_STATE_COLOR[pr.mentionType] }}>{pr.mentionType.replace('_', ' ')}</span>
          <span>·</span><span>{pr.author.login}</span>
        </div>
      </div>
    </div>
  );
}

function SubLabel({
  label, count, open, onToggle,
}: { label: string; count: number; open: boolean; onToggle: () => void }) {
  return (
    <div
      role="button"
      onClick={onToggle}
      style={{
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        margin: '4px 10px 2px', padding: '4px 4px',
        fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11,
        fontWeight: 600, color: 'rgba(255,255,255,0.4)',
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s', flexShrink: 0 }}>
        <path d="M1 2.5L4 5.5L7 2.5" />
      </svg>
      <span>Pull requests</span>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>{count}</span>
    </div>
  );
}

function RootHeader({
  root, open, onToggle, onNewWorktree,
}: {
  root: RootItem; open: boolean; onToggle: () => void; onNewWorktree: () => void;
}) {
  return (
    <div
      role="button"
      onClick={onToggle}
      style={{
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
        margin: '8px 8px 2px', padding: '7px 9px', borderRadius: 9,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <svg width="11" height="11" viewBox="0 0 8 8" fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s', flexShrink: 0 }}>
        <path d="M1 2.5L4 5.5L7 2.5" />
      </svg>
      {/* Monogram */}
      <span style={{
        width: 22, height: 22, borderRadius: 7,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
        color: 'rgba(255,255,255,0.6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11, fontWeight: 600, flexShrink: 0,
      }}>{root.name[0]?.toUpperCase()}</span>
      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 13, fontWeight: 600,
        color: 'rgba(255,255,255,0.92)', flex: 1, minWidth: 0, letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{root.name}</span>
      {root.dirty && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d9c98a', flexShrink: 0 }} />
      )}
      <button
        title="New worktree"
        onClick={(e) => { e.stopPropagation(); onNewWorktree(); }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, borderRadius: 6, color: 'rgba(255,255,255,0.4)',
          background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export function FusionSidebar({
  roots, view, onSelect, onNewWorktree, onAddRepo,
}: {
  roots: RootItem[];
  view: ViewState | null;
  onSelect: (v: ViewState) => void;
  onNewWorktree: (rootPath: string) => void;
  onAddRepo: () => void;
}) {
  const patchSettings = useSettingsPatch();
  const [openRoots, setOpenRoots] = useState<Record<string, boolean>>({});
  const [prSectionsOpen, setPrSectionsOpen] = useState<Record<string, boolean>>({});
  const [showPR, setShowPR] = useState<Record<string, boolean>>({});
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    void window.electronAPI.settingsGet().then((s) => {
      setOpenRoots(s.review.openRoots);
      setPrSectionsOpen(s.review.prSectionsOpen);
      setShowPR(s.review.showPR);
      setSettingsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    setOpenRoots((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const root of roots) {
        if (!(root.path in next)) {
          next[root.path] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [roots, settingsReady]);

  const toggleRoot = (path: string) => {
    setOpenRoots((prev) => {
      const nextOpen = prev[path] === false;
      const next = { ...prev, [path]: nextOpen };
      patchSettings({ review: { openRoots: { [path]: nextOpen } } });
      return next;
    });
  };

  const togglePR = (path: string) => {
    setPrSectionsOpen((prev) => {
      const nextOpen = prev[path] === false;
      const next = { ...prev, [path]: nextOpen };
      patchSettings({ review: { prSectionsOpen: { [path]: nextOpen } } });
      return next;
    });
  };

  return (
    <div style={{
      width: 322, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'rgba(16,17,22,1)', borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {roots.map((root) => {
          const open = openRoots[root.path] !== false;
          const prOpen = prSectionsOpen[root.path] !== false;
          const showPrSection = showPR[root.name] !== false;
          return (
            <div key={root.path}>
              <RootHeader
                root={root}
                open={open}
                onToggle={() => toggleRoot(root.path)}
                onNewWorktree={() => onNewWorktree(root.path)}
              />
              {open && (
                <>
                  {root.worktrees.map((w) => (
                    <WtRow
                      key={w.path}
                      w={w}
                      active={view?.type === 'wt' && view.repoPath === root.path && view.worktreePath === w.path}
                      onClick={() => onSelect({ type: 'wt', repoPath: root.path, worktreePath: w.path })}
                    />
                  ))}
                  {showPrSection && root.prs.length > 0 && (
                    <SubLabel
                      label="Pull requests"
                      count={root.prs.length}
                      open={prOpen}
                      onToggle={() => togglePR(root.path)}
                    />
                  )}
                  {prOpen && root.prs.map((pr) => (
                    <PRRow
                      key={pr.id}
                      pr={pr}
                      active={view?.type === 'pr' && view.prId === pr.id}
                      onClick={() => onSelect({ type: 'pr', prId: pr.id })}
                    />
                  ))}
                  {prOpen && root.prs.length === 0 && (
                    <div style={{
                      margin: '1px 8px', padding: '5px 9px 7px 28px',
                      fontSize: 11, color: 'rgba(255,255,255,0.2)',
                      fontFamily: 'var(--gh-font-mono, monospace)',
                    }}>no open PRs</div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <div style={{ padding: '8px 12px 4px' }}>
          <button
            onClick={onAddRepo}
            style={{
              width: '100%', height: 34, borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)',
              fontSize: 12.5, fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'transparent', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add local repository…
          </button>
        </div>
      </div>
    </div>
  );
}
