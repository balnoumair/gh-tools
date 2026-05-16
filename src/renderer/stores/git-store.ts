import { create } from 'zustand';
import type {
  EditorTarget,
  GitOperationResult,
  GitRepo,
  GitRepoStatus,
  MergeOptions,
  PushOptions,
  StashApplyOptions,
  StashCreateOptions,
  UpdateOptions,
} from '@shared/types';

type OperationStatus = 'idle' | 'running' | 'success' | 'error';
type ToastKind = 'success' | 'error' | 'info';

interface TransientToast {
  message: string;
  kind: ToastKind;
}

interface GitStore {
  activeRepo: GitRepo | null;
  recentRepos: GitRepo[];
  repoStatus: GitRepoStatus | null;
  isLoadingStatus: boolean;
  operationStatus: OperationStatus;
  lastResult: GitOperationResult | null;
  transientToast: TransientToast | null;
  error: string | null;

  showMergeDialog: boolean;
  showPushDialog: boolean;
  showUpdateDialog: boolean;
  showStashCreateDialog: boolean;
  showCreateBranchDialog: boolean;

  selectRepo: () => Promise<void>;
  openRepo: (repo: GitRepo) => Promise<void>;
  closeRepo: () => Promise<void>;
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
  createWorktree: (branch: string, targetPath: string) => Promise<void>;
  removeWorktree: (worktreePath: string, force?: boolean) => Promise<void>;
  commitInWorktree: (worktreePath: string, message: string, alsoPush?: boolean) => Promise<void>;
  syncWorktree: (worktreePath: string, branch: string) => Promise<void>;
  openInEditor: (target: EditorTarget, path: string) => Promise<void>;
  showToast: (message: string, kind?: ToastKind) => void;

  setShowMergeDialog: (v: boolean) => void;
  setShowPushDialog: (v: boolean) => void;
  setShowUpdateDialog: (v: boolean) => void;
  setShowStashCreateDialog: (v: boolean) => void;
  setShowCreateBranchDialog: (v: boolean) => void;

  hydrateRecents: () => Promise<void>;
}

let toastTimer: number | undefined;
type GitStoreSetter = (partial: Partial<GitStore> | ((state: GitStore) => Partial<GitStore>)) => void;

function loadLegacyRecentRepos(): GitRepo[] {
  try {
    const raw = localStorage.getItem('ghv:recent-repos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toGitRepos(
  recents: Array<{ path: string; name: string }>,
): GitRepo[] {
  return recents.map((repo) => ({ path: repo.path, name: repo.name }));
}

function setOperationResult(
  set: GitStoreSetter,
  res: GitOperationResult,
) {
  set({ operationStatus: res.success ? 'success' : 'error', lastResult: res });
}

export const useGitStore = create<GitStore>((set, get) => ({
  activeRepo: null,
  recentRepos: [],
  repoStatus: null,
  isLoadingStatus: false,
  operationStatus: 'idle',
  lastResult: null,
  transientToast: null,
  error: null,

  showMergeDialog: false,
  showPushDialog: false,
  showUpdateDialog: false,
  showStashCreateDialog: false,
  showCreateBranchDialog: false,

  hydrateRecents: async () => {
    try {
      const legacy = loadLegacyRecentRepos();
      const shared = await window.electronAPI.gitLoadRecents(legacy);
      if (legacy.length > 0) {
        localStorage.removeItem('ghv:recent-repos');
      }
      set({ recentRepos: toGitRepos(shared) });
    } catch {
      set({ recentRepos: loadLegacyRecentRepos() });
    }
  },

  selectRepo: async () => {
    try {
      const repo = await window.electronAPI.gitSelectRepo();
      if (repo) {
        const shared = await window.electronAPI.gitTouchRecent(repo);
        set({
          activeRepo: repo,
          recentRepos: toGitRepos(shared),
          repoStatus: null,
          error: null,
        });
        await window.electronAPI.setWindowSize(380, 680);
        await get().refreshStatus();
      }
    } catch {
      set({ error: 'Failed to select repository' });
    }
  },

  openRepo: async (repo) => {
    const shared = await window.electronAPI.gitTouchRecent(repo);
    set({
      activeRepo: repo,
      recentRepos: toGitRepos(shared),
      repoStatus: null,
      error: null,
    });
    await window.electronAPI.setWindowSize(380, 680);
    await get().refreshStatus();
  },

  closeRepo: async () => {
    set({ activeRepo: null, repoStatus: null, error: null });
    await window.electronAPI.setWindowSize(920, 580);
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
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  createBranch: async (name, startPoint) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitCreateBranch(activeRepo.path, name, startPoint);
    set({
      operationStatus: res.success ? 'success' : 'error',
      lastResult: res,
      showCreateBranchDialog: false,
    });
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  deleteBranch: async (branch, force) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitDeleteBranch(activeRepo.path, branch, force);
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  merge: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showMergeDialog: false });
    const res = await window.electronAPI.gitMerge({ ...opts, repoPath: activeRepo.path });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    await get().refreshStatus();
  },

  push: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showPushDialog: false });
    const res = await window.electronAPI.gitPush({ ...opts, repoPath: activeRepo.path });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  fetch: async (remote) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitFetch(activeRepo.path, remote);
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  pull: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showUpdateDialog: false });
    const res = await window.electronAPI.gitPull({ ...opts, repoPath: activeRepo.path });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  stashCreate: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running', showStashCreateDialog: false });
    const res = await window.electronAPI.gitStashCreate({ ...opts, repoPath: activeRepo.path });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  stashApply: async (opts) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitStashApply({ ...opts, repoPath: activeRepo.path });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  stashDrop: async (stashIndex) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitStashDrop(activeRepo.path, stashIndex);
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  createWorktree: async (branch, targetPath) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitCreateWorktree({
      repoPath: activeRepo.path,
      branch,
      targetPath,
    });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  removeWorktree: async (worktreePath, force) => {
    const { activeRepo } = get();
    if (!activeRepo) return;
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitRemoveWorktree({
      repoPath: activeRepo.path,
      worktreePath,
      force,
    });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  commitInWorktree: async (worktreePath, message, alsoPush) => {
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitCommitWorktree({
      worktreePath,
      message,
      alsoPush,
    });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  syncWorktree: async (worktreePath, branch) => {
    set({ operationStatus: 'running' });
    const res = await window.electronAPI.gitPull({
      repoPath: worktreePath,
      strategy: 'merge',
      branch,
    });
    setOperationResult(set, res);
    get().showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) await get().refreshStatus();
  },

  openInEditor: async (target, path) => {
    const res = await window.electronAPI.openInEditor(target, path);
    get().showToast(res.message, res.success ? 'success' : 'error');
  },

  showToast: (message, kind = 'info') => {
    if (toastTimer) window.clearTimeout(toastTimer);
    set({ transientToast: { message, kind } });
    toastTimer = window.setTimeout(() => set({ transientToast: null }), 3000);
  },

  setShowMergeDialog: (v) => set({ showMergeDialog: v }),
  setShowPushDialog: (v) => set({ showPushDialog: v }),
  setShowUpdateDialog: (v) => set({ showUpdateDialog: v }),
  setShowStashCreateDialog: (v) => set({ showStashCreateDialog: v }),
  setShowCreateBranchDialog: (v) => set({ showCreateBranchDialog: v }),
}));
