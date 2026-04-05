import { create } from 'zustand';
import type {
  GitRepo,
  GitRepoStatus,
  GitOperationResult,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
} from '@shared/types';

type OperationStatus = 'idle' | 'running' | 'success' | 'error';

interface GitStore {
  activeRepo: GitRepo | null;
  recentRepos: GitRepo[];
  repoStatus: GitRepoStatus | null;
  isLoadingStatus: boolean;
  operationStatus: OperationStatus;
  lastResult: GitOperationResult | null;
  outputLog: string[];
  error: string | null;

  showMergeDialog: boolean;
  showPushDialog: boolean;
  showUpdateDialog: boolean;
  showStashCreateDialog: boolean;
  showCreateBranchDialog: boolean;

  selectRepo: () => Promise<void>;
  openRepo: (repo: GitRepo) => Promise<void>;
  refreshStatus: () => Promise<void>;
  checkoutBranch: (branch: string) => Promise<void>;
  createBranch: (name: string, startPoint?: string) => Promise<void>;
  deleteBranch: (branch: string, force?: boolean) => Promise<void>;
  merge: (opts: Omit<MergeOptions, 'repoPath'>) => Promise<void>;
  push: (opts: Omit<PushOptions, 'repoPath'>) => Promise<void>;
  fetch: (remote?: string) => Promise<void>;
  pull: (opts: Omit<UpdateOptions, 'repoPath'>) => Promise<void>;
  stashCreate: (opts: Omit<StashCreateOptions, 'repoPath'>) => Promise<void>;
  stashApply: (opts: Omit<StashApplyOptions, 'repoPath'>) => Promise<void>;
  stashDrop: (stashIndex: number) => Promise<void>;

  setShowMergeDialog: (v: boolean) => void;
  setShowPushDialog: (v: boolean) => void;
  setShowUpdateDialog: (v: boolean) => void;
  setShowStashCreateDialog: (v: boolean) => void;
  setShowCreateBranchDialog: (v: boolean) => void;

  appendOutput: (line: string) => void;
  clearOutput: () => void;
}

function loadRecentRepos(): GitRepo[] {
  try {
    const raw = localStorage.getItem('ghv:recent-repos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentRepos(repos: GitRepo[]) {
  localStorage.setItem('ghv:recent-repos', JSON.stringify(repos.slice(0, 10)));
}

function addToRecent(repo: GitRepo, current: GitRepo[]): GitRepo[] {
  const filtered = current.filter((r) => r.path !== repo.path);
  const updated = [repo, ...filtered].slice(0, 10);
  saveRecentRepos(updated);
  return updated;
}

export const useGitStore = create<GitStore>((set, get) => ({
  activeRepo: null,
  recentRepos: loadRecentRepos(),
  repoStatus: null,
  isLoadingStatus: false,
  operationStatus: 'idle',
  lastResult: null,
  outputLog: [],
  error: null,

  showMergeDialog: false,
  showPushDialog: false,
  showUpdateDialog: false,
  showStashCreateDialog: false,
  showCreateBranchDialog: false,

  selectRepo: async () => {
    try {
      const repo = await window.electronAPI.gitSelectRepo();
      if (repo) {
        set({
          activeRepo: repo,
          recentRepos: addToRecent(repo, get().recentRepos),
          repoStatus: null,
          error: null,
        });
        await get().refreshStatus();
      }
    } catch {
      set({ error: 'Failed to select repository' });
    }
  },

  openRepo: async (repo) => {
    set({
      activeRepo: repo,
      recentRepos: addToRecent(repo, get().recentRepos),
      repoStatus: null,
      error: null,
    });
    await get().refreshStatus();
  },

  refreshStatus: async () => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ isLoadingStatus: true });
    try {
      const status = await window.electronAPI.gitGetRepoStatus(activeRepo.path);
      set({ repoStatus: status, isLoadingStatus: false, error: null });
    } catch {
      set({ isLoadingStatus: false, error: 'Failed to load repo status' });
    }
  },

  checkoutBranch: async (branch) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitCheckoutBranch(activeRepo.path, branch);
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  createBranch: async (name, startPoint) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitCreateBranch(activeRepo.path, name, startPoint);
    get().appendOutput(res.message);
    set({
      operationStatus: res.success ? 'success' : 'error',
      lastResult: res,
      showCreateBranchDialog: false,
    });
    if (res.success) await get().refreshStatus();
  },

  deleteBranch: async (branch, force) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitDeleteBranch(activeRepo.path, branch, force);
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  merge: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showMergeDialog: false });
    const res = await window.electronAPI.gitMerge({ ...opts, repoPath: activeRepo.path });
    get().appendOutput(res.message);
    if (res.output) get().appendOutput(res.output);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    await get().refreshStatus();
  },

  push: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showPushDialog: false });
    const res = await window.electronAPI.gitPush({ ...opts, repoPath: activeRepo.path });
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  fetch: async (remote) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitFetch(activeRepo.path, remote);
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  pull: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showUpdateDialog: false });
    const res = await window.electronAPI.gitPull({ ...opts, repoPath: activeRepo.path });
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  stashCreate: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showStashCreateDialog: false });
    const res = await window.electronAPI.gitStashCreate({ ...opts, repoPath: activeRepo.path });
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  stashApply: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitStashApply({ ...opts, repoPath: activeRepo.path });
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  stashDrop: async (stashIndex) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitStashDrop(activeRepo.path, stashIndex);
    get().appendOutput(res.message);
    set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
    if (res.success) await get().refreshStatus();
  },

  setShowMergeDialog: (v) => set({ showMergeDialog: v }),
  setShowPushDialog: (v) => set({ showPushDialog: v }),
  setShowUpdateDialog: (v) => set({ showUpdateDialog: v }),
  setShowStashCreateDialog: (v) => set({ showStashCreateDialog: v }),
  setShowCreateBranchDialog: (v) => set({ showCreateBranchDialog: v }),

  appendOutput: (line) =>
    set((state) => ({
      outputLog: [...state.outputLog.slice(-200), `[${new Date().toLocaleTimeString()}] ${line}`],
    })),
  clearOutput: () => set({ outputLog: [] }),
}));
