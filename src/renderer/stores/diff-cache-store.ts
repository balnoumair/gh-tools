import { create } from 'zustand';
import type { DiffResult, PullRequest, WorktreeDiffResult } from '@shared/types';

function prDiffKey(pr: Pick<PullRequest, 'number' | 'repoFullName'>): string {
  return `${pr.repoFullName}#${pr.number}`;
}

interface DiffCacheStore {
  prDiffs: Record<string, DiffResult>;
  prInflight: Record<string, Promise<DiffResult>>;
  worktreeDiffs: Record<string, WorktreeDiffResult>;
  worktreeInflight: Record<string, Promise<WorktreeDiffResult>>;

  getPRDiff: (pr: Pick<PullRequest, 'number' | 'repoFullName'>) => DiffResult | null;
  loadPRDiff: (pr: Pick<PullRequest, 'number' | 'repoFullName'>) => Promise<DiffResult>;
  clearPRDiffs: () => void;

  getWorktreeDiff: (worktreePath: string) => WorktreeDiffResult | null;
  loadWorktreeDiff: (worktreePath: string) => Promise<WorktreeDiffResult>;
  clearWorktreeDiff: (worktreePath: string) => void;
}

export const useDiffCacheStore = create<DiffCacheStore>((set, get) => ({
  prDiffs: {},
  prInflight: {},
  worktreeDiffs: {},
  worktreeInflight: {},

  getPRDiff: (pr) => get().prDiffs[prDiffKey(pr)] ?? null,

  loadPRDiff: async (pr) => {
    const key = prDiffKey(pr);
    const cached = get().prDiffs[key];
    if (cached) return cached;

    const inflight = get().prInflight[key];
    if (inflight) return inflight;

    const request = window.electronAPI.getPRDiff(pr.number, pr.repoFullName)
      .then((result) => {
        set((state) => ({
          prDiffs: { ...state.prDiffs, [key]: result },
          prInflight: Object.fromEntries(
            Object.entries(state.prInflight).filter(([k]) => k !== key),
          ),
        }));
        return result;
      })
      .catch((err) => {
        set((state) => ({
          prInflight: Object.fromEntries(
            Object.entries(state.prInflight).filter(([k]) => k !== key),
          ),
        }));
        throw err;
      });

    set((state) => ({ prInflight: { ...state.prInflight, [key]: request } }));
    return request;
  },

  clearPRDiffs: () => set({ prDiffs: {}, prInflight: {} }),

  getWorktreeDiff: (worktreePath) => get().worktreeDiffs[worktreePath] ?? null,

  loadWorktreeDiff: async (worktreePath) => {
    const cached = get().worktreeDiffs[worktreePath];
    if (cached) return cached;

    const inflight = get().worktreeInflight[worktreePath];
    if (inflight) return inflight;

    const request = window.electronAPI.getWorktreeDiff(worktreePath)
      .then((result) => {
        set((state) => ({
          worktreeDiffs: { ...state.worktreeDiffs, [worktreePath]: result },
          worktreeInflight: Object.fromEntries(
            Object.entries(state.worktreeInflight).filter(([k]) => k !== worktreePath),
          ),
        }));
        return result;
      })
      .catch((err) => {
        set((state) => ({
          worktreeInflight: Object.fromEntries(
            Object.entries(state.worktreeInflight).filter(([k]) => k !== worktreePath),
          ),
        }));
        throw err;
      });

    set((state) => ({
      worktreeInflight: { ...state.worktreeInflight, [worktreePath]: request },
    }));
    return request;
  },

  clearWorktreeDiff: (worktreePath) => {
    set((state) => {
      const { [worktreePath]: _removed, ...worktreeDiffs } = state.worktreeDiffs;
      const { [worktreePath]: _inflight, ...worktreeInflight } = state.worktreeInflight;
      return { worktreeDiffs, worktreeInflight };
    });
  },
}));
