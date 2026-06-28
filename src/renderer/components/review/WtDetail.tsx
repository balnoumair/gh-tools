import React, { useEffect, useMemo, useState } from 'react';
import type { GitWorktree, PullRequest, WorktreeDiffResult } from '@shared/types';
import type { EditorTarget } from '@shared/types';
import { FileDiff, DiffSectionBand } from './FileDiff';
import { DiffLoadingSkeleton } from './DiffLoadingSkeleton';
import { useSettingsStore } from '../../stores/settings-store';
import { useDiffCacheStore } from '../../stores/diff-cache-store';

const EDITORS: { id: EditorTarget; label: string }[] = [
  { id: 'cursor', label: 'Cursor' },
  { id: 'claude', label: 'Claude' },
  { id: 'codex', label: 'Codex' },
  { id: 'zed', label: 'Zed' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'finder', label: 'Finder' },
];

type DiffTab = 'uncommitted' | 'committed';

function IconCommit({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconPush({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function IconPull({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function DiffTabBar({
  active, uncommittedCount, committedCount, onChange,
}: {
  active: DiffTab;
  uncommittedCount: number;
  committedCount: number;
  onChange: (tab: DiffTab) => void;
}) {
  const tabs: { id: DiffTab; label: string; count: number; tone?: string }[] = [
    { id: 'uncommitted', label: 'Uncommitted', count: uncommittedCount, tone: '#d9c98a' },
    { id: 'committed', label: 'Committed', count: committedCount },
  ];

  return (
    <div style={{
      display: 'flex', gap: 4, padding: '10px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(23,24,28,1)',
      position: 'sticky', top: 0, zIndex: 2,
    }}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              height: 28, padding: '0 11px', borderRadius: 7,
              fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              background: selected ? 'rgba(139,143,240,0.15)' : 'rgba(255,255,255,0.03)',
              color: selected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)',
              border: selected ? '1px solid rgba(139,143,240,0.40)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {tab.tone && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tab.tone, flexShrink: 0 }} />
            )}
            {tab.label}
            <span style={{
              fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10.5, fontWeight: 500,
              color: selected ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)',
            }}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function ActionBtn({
  children, primary, onClick, disabled,
}: {
  children: React.ReactNode; primary?: boolean; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 30, padding: primary ? '0 13px' : '0 11px', borderRadius: 8,
        fontSize: 12, fontWeight: primary ? 600 : 500,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: primary ? '#8b8ff0' : 'rgba(255,255,255,0.04)',
        color: primary ? '#0e0f14' : 'rgba(255,255,255,0.85)',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.12)',
        display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function WtDetail({
  worktree, repoPath, linkedPr,
  onCreateWorktree, onRemoveWorktree,
}: {
  worktree: GitWorktree;
  repoPath: string;
  linkedPr?: PullRequest;
  onCreateWorktree: (branch: string) => void;
  onRemoveWorktree: () => void;
}) {
  const [diff, setDiff] = useState<WorktreeDiffResult | null>(
    () => useDiffCacheStore.getState().getWorktreeDiff(worktree.path),
  );
  const [loading, setLoading] = useState(() => !useDiffCacheStore.getState().getWorktreeDiff(worktree.path));
  const [diffTab, setDiffTab] = useState<DiffTab>('uncommitted');
  const [menuOpen, setMenuOpen] = useState(false);
  const [composer, setComposer] = useState<'branch' | 'worktree' | null>(null);
  const [newName, setNewName] = useState('');
  const editorPrefs = useSettingsStore((state) => state.settings.review.editors);
  const visibleEditors = useMemo(
    () => EDITORS.filter((ed) => editorPrefs[ed.id]),
    [editorPrefs],
  );

  const folderName = worktree.path.split('/').pop() ?? '';

  useEffect(() => {
    const cached = useDiffCacheStore.getState().getWorktreeDiff(worktree.path);
    if (cached) {
      setDiff(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void useDiffCacheStore.getState().loadWorktreeDiff(worktree.path)
      .then((result) => {
        if (!cancelled) {
          setDiff(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDiff(null);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [worktree.path]);

  const uncommittedCount = diff?.uncommitted.files.length ?? 0;
  const committedCount = diff?.committed.files.length ?? 0;
  const showDiffTabs = !loading && uncommittedCount > 0 && committedCount > 0;

  useEffect(() => {
    if (uncommittedCount > 0) setDiffTab('uncommitted');
    else if (committedCount > 0) setDiffTab('committed');
  }, [worktree.path, uncommittedCount, committedCount]);

  const handleEditor = (id: EditorTarget) => {
    window.electronAPI.openInEditor(id, worktree.path).catch(() => {});
  };

  const submitComposer = () => {
    if (newName.trim()) {
      onCreateWorktree(newName.trim());
      setComposer(null);
      setNewName('');
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div style={{
        height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(23,24,28,1)',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span style={{ fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          {folderName}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>
          {worktree.dirty ? 'modified' : 'clean'}
        </span>
      </div>

      {/* Header */}
      <div style={{
        padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', gap: 13, flexShrink: 0,
      }}>
        {/* Branch row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8ff0"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span style={{
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 15.5, fontWeight: 600,
            color: 'rgba(255,255,255,0.92)', flex: 1, minWidth: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{worktree.branch}</span>
          {worktree.primary && (
            <span style={{
              fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 10,
              padding: '2px 7px', borderRadius: 6,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontWeight: 600,
            }}>primary</span>
          )}
          {linkedPr && (
            <button
              type="button"
              title="Open on GitHub"
              onClick={() => window.electronAPI.openExternal(linkedPr.url)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: '#8b8ff0',
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a8abff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#8b8ff0'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
              </svg>
              #{linkedPr.number}
            </button>
          )}
        </div>

        {/* Status row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.45)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: worktree.dirty ? '#d9c98a' : '#6fcf97',
            }} />
            {worktree.dirty ? 'modified' : 'working tree clean'}
          </span>
          <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.09)' }} />
          <span>↑{worktree.ahead} ↓{worktree.behind}</span>
          <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.09)' }} />
          <span style={{
            color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', maxWidth: 280,
          }}>{worktree.path}</span>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Editor strip */}
          <div style={{
            display: 'inline-flex', gap: 4,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 8, padding: '3px 4px',
          }}>
            {visibleEditors.map((ed) => (
              <button key={ed.id} onClick={() => handleEditor(ed.id)} style={{
                height: 24, padding: '0 9px', borderRadius: 5,
                fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11, fontWeight: 500,
                color: 'rgba(255,255,255,0.55)', background: 'transparent', border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
              >
                {ed.label}
              </button>
            ))}
          </div>

          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.05)', margin: '0 2px' }} />

          {worktree.dirty && (
            <ActionBtn primary>
              <IconCommit />
              Commit
            </ActionBtn>
          )}
          <ActionBtn>
            <IconPush />
            Push
          </ActionBtn>
          <ActionBtn>
            <IconPull />
            Pull
          </ActionBtn>
          {worktree.behind > 0 && (
            <ActionBtn>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                <path d="M6 9v9M13 6h3a2 2 0 0 1 2 2v7" />
              </svg>
              Merge main
            </ActionBtn>
          )}

          <span style={{ flex: 1 }} />

          {/* ⋯ menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                height: 28, width: 30, borderRadius: 6,
                background: menuOpen ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 32, right: 0, zIndex: 40, width: 200,
                background: 'rgba(28,28,32,0.98)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.55)', padding: 5,
              }}>
                {[
                  { label: 'New branch…', action: () => { setMenuOpen(false); setComposer('branch'); } },
                  { label: 'New worktree…', action: () => { setMenuOpen(false); setComposer('worktree'); } },
                  { label: 'Delete branch', danger: true, disabled: worktree.primary, action: () => {} },
                  { label: 'Remove worktree', danger: true, disabled: worktree.primary, action: () => { setMenuOpen(false); onRemoveWorktree(); } },
                ].map((item) => (
                  <button key={item.label} onClick={item.action} disabled={item.disabled} style={{
                    display: 'flex', alignItems: 'center', width: '100%', padding: '7px 10px', borderRadius: 5,
                    fontSize: 12.5, cursor: item.disabled ? 'default' : 'pointer', background: 'transparent', border: 'none',
                    color: item.danger ? (item.disabled ? 'rgba(255,255,255,0.2)' : '#e98b8b') : 'rgba(255,255,255,0.85)',
                    opacity: item.disabled ? 0.5 : 1,
                  }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {composer && (
              <div style={{
                position: 'absolute', top: 32, right: 0, zIndex: 40, width: 276,
                background: 'rgba(28,28,32,0.98)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.55)', padding: 10,
              }}>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>
                  {composer === 'branch' ? 'New branch (creates a worktree)' : 'New worktree from branch'}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7, height: 30,
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 6, padding: '0 9px',
                }}>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') submitComposer(); if (e.key === 'Escape') { setComposer(null); setNewName(''); } }}
                    placeholder={composer === 'branch' ? 'feature/my-branch' : 'existing-branch'}
                    style={{
                      flex: 1, background: 'transparent', border: 0, outline: 'none',
                      color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 9 }}>
                  <button onClick={() => { setComposer(null); setNewName(''); }} style={{
                    height: 26, padding: '0 10px', borderRadius: 5, fontSize: 11.5,
                    color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer',
                  }}>Cancel</button>
                  <button onClick={submitComposer} disabled={!newName.trim()} style={{
                    height: 26, padding: '0 12px', borderRadius: 5, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                    background: newName.trim() ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)',
                    color: newName.trim() ? '#15151a' : 'rgba(255,255,255,0.3)', border: 'none',
                  }}>Create</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diff */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(23,24,28,1)' }}>
        {loading ? (
          <DiffLoadingSkeleton label="Loading worktree diff" />
        ) : diff ? (
          <>
            {showDiffTabs && (
              <DiffTabBar
                active={diffTab}
                uncommittedCount={uncommittedCount}
                committedCount={committedCount}
                onChange={setDiffTab}
              />
            )}
            {!showDiffTabs && uncommittedCount > 0 && (
              <DiffSectionBand
                icon={<span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d9c98a', display: 'block' }} />}
                label="Uncommitted · working tree"
                count={uncommittedCount}
                tone="#d9c98a"
              />
            )}
            {(!showDiffTabs || diffTab === 'uncommitted') && diff.uncommitted.files.map((f, i) => (
              <FileDiff key={`u${i}`} file={f} />
            ))}
            {!showDiffTabs && committedCount > 0 && (
              <DiffSectionBand
                icon={
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" /><line x1="1.05" y1="12" x2="7" y2="12" />
                    <line x1="17.01" y1="12" x2="22.96" y2="12" />
                  </svg>
                }
                label="Committed · ahead of main"
                count={committedCount}
              />
            )}
            {(!showDiffTabs || diffTab === 'committed') && diff.committed.files.map((f, i) => (
              <FileDiff key={`c${i}`} file={f} />
            ))}
            {uncommittedCount === 0 && committedCount === 0 && (
              <div style={{
                padding: '24px 18px', textAlign: 'center',
                fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.25)',
              }}>Working tree clean — up to date with main.</div>
            )}
            {(uncommittedCount > 0 || committedCount > 0) && (
              <div style={{
                padding: '14px 18px', textAlign: 'center', fontSize: 11,
                color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--gh-font-mono, monospace)',
              }}>~ end of diff ~</div>
            )}
          </>
        ) : (
          <div style={{
            padding: '24px 18px', textAlign: 'center',
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.25)',
          }}>Could not load diff.</div>
        )}
      </div>
    </>
  );
}
