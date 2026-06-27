import React, { useEffect, useState, useCallback } from 'react';
import { repoFromRendererSearchParams } from '@shared/deep-link';
import { usePRStore } from '../stores/pr-store';
import { FusionSidebar, type RootItem, type ViewState } from '../components/review/FusionSidebar';
import { PRDetail } from '../components/review/PRDetail';
import { WtDetail } from '../components/review/WtDetail';
import { SettingsView } from '../components/review/SettingsView';
import type { GitRepoStatus, GitRepo } from '@shared/types';

// Indigo PR icon for title bar
function PRIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}

function RefreshIcon({ size = 14, spinning }: { size?: number; spinning?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={spinning ? 'animate-spin' : ''}>
      <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L4 7m16 10l-1.64-1.36A9 9 0 0 1 3.51 15"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CC_THEME: React.CSSProperties = {
  '--gh-bg-0': '#0a0b0d',
  '--gh-bg-1': '#17181c',
  '--gh-bg-2': '#101116',
  '--gh-bg-3': '#1e2026',
  '--gh-bg-4': '#23252c',
  '--gh-line-1': 'rgba(255,255,255,0.05)',
  '--gh-line-2': 'rgba(255,255,255,0.09)',
  '--gh-line-3': 'rgba(255,255,255,0.14)',
  '--gh-fg-1': '#ECEDEF',
  '--gh-fg-2': '#A4A9B2',
  '--gh-fg-3': '#71767E',
  '--gh-fg-4': '#4B505A',
  '--gh-success': '#6fcf97',
  '--gh-danger': '#e98b8b',
  '--gh-warn': '#d9c98a',
  '--gh-info': '#8fa6e6',
  '--cc-accent': '#8b8ff0',
  '--cc-accent-soft': 'rgba(139,143,240,0.15)',
  '--cc-accent-line': 'rgba(139,143,240,0.40)',
} as React.CSSProperties;

export default function FullApp() {
  const { prs, fetchPRs, forceRefresh, isRefreshing } = usePRStore();
  const [roots, setRoots] = useState<RootItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, GitRepoStatus>>({});
  const [view, setView] = useState<ViewState | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Load recents and repo statuses
  const loadRoots = useCallback(async () => {
    try {
      const recents = await window.electronAPI.gitLoadRecents();
      const recentRepos = recents.map((r) => ({ path: r.path, name: r.name }));

      // Build root items from recents + PRs
      const builds: RootItem[] = recentRepos.map((r) => ({
        name: r.name,
        path: r.path,
        dirty: false,
        worktrees: [],
        prs: prs.filter((p) => p.repoFullName.split('/').pop() === r.name || p.repoFullName === r.name),
        loading: true,
      }));
      setRoots(builds);

      // Fetch statuses in parallel
      const statusResults = await Promise.allSettled(
        recentRepos.map((r) =>
          window.electronAPI.gitGetRepoStatus(r.path).then((s) => ({ path: r.path, status: s })),
        ),
      );

      const newStatuses: Record<string, GitRepoStatus> = {};
      for (const result of statusResults) {
        if (result.status === 'fulfilled') {
          newStatuses[result.value.path] = result.value.status;
        }
      }
      setStatuses(newStatuses);

      setRoots(
        recentRepos.map((r) => {
          const status = newStatuses[r.path];
          const repoPrs = prs.filter(
            (p) => p.repoFullName.split('/').pop() === r.name || p.repoFullName === r.name,
          );
          return {
            name: r.name,
            path: r.path,
            dirty: status?.hasUncommittedChanges ?? false,
            worktrees: status?.worktrees ?? [],
            prs: repoPrs,
            loading: false,
          };
        }),
      );
    } catch {
      // silently fail — empty roots
    }
  }, [prs]);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs]);

  useEffect(() => {
    loadRoots();
  }, [loadRoots]);

  // Handle deep links
  useEffect(() => {
    const initialRepo = repoFromRendererSearchParams(window.location.search);
    if (initialRepo) {
      window.electronAPI.gitTouchRecent(initialRepo).then(() => loadRoots()).catch(() => {});
    }

    const unsub = window.electronAPI.onOpenRepoRequested((repo: GitRepo) => {
      window.electronAPI.gitTouchRecent(repo).then(() => loadRoots()).catch(() => {});
    });
    return unsub;
  }, [loadRoots]);

  // Resolve current pr/wt from view state
  const currentPR = view?.type === 'pr' ? prs.find((p) => p.id === view.prId) ?? null : null;
  const currentRoot = view?.type === 'wt' ? roots.find((r) => r.path === view.repoPath) ?? null : null;
  const currentWt = currentRoot?.worktrees.find((w) => w.path === (view as { type: 'wt'; worktreePath: string }).worktreePath) ?? null;

  const prHasWorktree = currentPR
    ? roots.some((r) =>
        r.worktrees.some((w) => w.branch === currentPR.repoFullName.split('/').pop()),
      )
    : false;

  const handleCheckout = () => {
    if (!currentPR) return;
    // Create worktree for the PR's head branch — use git create worktree IPC
    const repoName = currentPR.repoFullName.split('/').pop() ?? '';
    const root = roots.find((r) => r.name === repoName);
    if (!root) return;
    // Use the PR branch as the worktree branch (this is a stub; real impl would fetch the branch name)
    const branch = `pr/${currentPR.number}`;
    const targetPath = `${root.path}-${branch.replace('/', '-')}`;
    window.electronAPI.gitCreateWorktree({ repoPath: root.path, branch, targetPath })
      .then(() => loadRoots())
      .catch(() => {});
  };

  const handleNewWorktree = (rootPath: string) => {
    const root = roots.find((r) => r.path === rootPath);
    if (!root) return;
    const branch = `feature/new-${Date.now()}`;
    const targetPath = `${rootPath}-${branch.replace('/', '-')}`;
    window.electronAPI.gitCreateWorktree({ repoPath: rootPath, branch, targetPath })
      .then(() => loadRoots())
      .catch(() => {});
  };

  const handleAddRepo = async () => {
    const repo = await window.electronAPI.gitSelectRepo();
    if (repo) {
      await window.electronAPI.gitTouchRecent(repo);
      loadRoots();
    }
  };

  const handleRemoveWorktree = () => {
    if (!currentWt || !currentRoot) return;
    window.electronAPI.gitRemoveWorktree({ repoPath: currentRoot.path, worktreePath: currentWt.path })
      .then(() => { setView(null); loadRoots(); })
      .catch(() => {});
  };

  return (
    <div style={{
      ...CC_THEME,
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: 'rgba(23,24,28,1)',
    }}>
      {/* Title bar */}
      <div style={{
        height: 44, flexShrink: 0,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(16,17,22,1)',
        // macOS inset traffic lights
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}>
        <span style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} />
        {/* Center: title */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 18, height: 18, borderRadius: 6,
            background: 'rgba(139,143,240,0.15)', border: '1px solid rgba(139,143,240,0.40)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8b8ff0',
          }}>
            <PRIcon size={11} />
          </span>
          <span style={{
            fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em',
          }}>
            {showSettings ? 'Settings' : 'Review'}
          </span>
        </div>
        {/* Right: controls */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end',
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties}>
          <button
            title="Refresh"
            onClick={() => { void forceRefresh(); void loadRoots(); }}
            style={{
              width: 30, height: 30, borderRadius: 8, color: 'rgba(255,255,255,0.4)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <RefreshIcon size={14} spinning={isRefreshing} />
          </button>
          <button
            title="Settings"
            onClick={() => setShowSettings((s) => !s)}
            style={{
              width: 30, height: 30, borderRadius: 8,
              color: showSettings ? '#8b8ff0' : 'rgba(255,255,255,0.4)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: showSettings ? 'rgba(139,143,240,0.15)' : 'transparent',
              border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { if (!showSettings) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { if (!showSettings) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar always visible */}
        <FusionSidebar
          roots={roots}
          view={showSettings ? { type: 'settings' } : view}
          onSelect={(v) => { setShowSettings(false); setView(v); }}
          onNewWorktree={handleNewWorktree}
          onAddRepo={handleAddRepo}
        />

        {/* Main pane */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {showSettings ? (
            <SettingsView />
          ) : view?.type === 'pr' && currentPR ? (
            <PRDetail
              pr={currentPR}
              hasWorktree={prHasWorktree}
              onCheckout={handleCheckout}
            />
          ) : view?.type === 'wt' && currentWt && currentRoot ? (
            <WtDetail
              worktree={currentWt}
              repoPath={currentRoot.path}
              onCreateWorktree={(branch) => {
                const targetPath = `${currentRoot.path}-${branch.replace('/', '-')}`;
                window.electronAPI.gitCreateWorktree({ repoPath: currentRoot.path, branch, targetPath })
                  .then(() => loadRoots())
                  .catch(() => {});
              }}
              onRemoveWorktree={handleRemoveWorktree}
            />
          ) : (
            /* Empty state */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              color: 'rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 13 }}>
                {roots.length === 0
                  ? 'Add a local repository to get started'
                  : 'Select a PR or worktree'}
              </div>
              {roots.length === 0 && (
                <button
                  onClick={handleAddRepo}
                  style={{
                    height: 32, padding: '0 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    background: '#8b8ff0', color: '#0e0f14', border: 'none', cursor: 'pointer',
                  }}
                >
                  Add repository…
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
