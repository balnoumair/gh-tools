import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@shared/ipc-channels';
import type { SharedRecentRepo } from '@shared/recents';
import type {
  PullRequest,
  AuthStatus,
  GitRepo,
  GitRepoStatus,
  GitWorktree,
  GitOperationResult,
  EditorTarget,
  EditorLaunchResult,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
  WorktreeCreateOptions,
  WorktreeRemoveOptions,
  WorktreeCommitOptions,
  DiffResult,
  WorktreeDiffResult,
} from '@shared/types';

const api = {
  // GitHub
  getPRs: (): Promise<PullRequest[]> =>
    ipcRenderer.invoke(IPC.GITHUB_GET_PRS),
  forceRefresh: (): Promise<PullRequest[]> =>
    ipcRenderer.invoke(IPC.GITHUB_FORCE_REFRESH),
  getAuthStatus: (): Promise<AuthStatus> =>
    ipcRenderer.invoke(IPC.GITHUB_GET_AUTH_STATUS),
  setPollInterval: (minutes: number): Promise<void> =>
    ipcRenderer.invoke(IPC.GITHUB_SET_POLL_INTERVAL, minutes),

  // Push events
  onPRsUpdated: (callback: (prs: PullRequest[]) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, prs: PullRequest[]) =>
      callback(prs);
    ipcRenderer.on(IPC.GITHUB_PRS_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPC.GITHUB_PRS_UPDATED, handler);
  },

  // App
  onOpenRepoRequested: (callback: (repo: GitRepo) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, repo: GitRepo) =>
      callback(repo);
    ipcRenderer.on(IPC.APP_OPEN_REPO, handler);
    return () => ipcRenderer.removeListener(IPC.APP_OPEN_REPO, handler);
  },
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC.APP_OPEN_EXTERNAL, url),
  setWindowSize: (width: number, height: number): Promise<void> =>
    ipcRenderer.invoke(IPC.APP_SET_WINDOW_SIZE, width, height),

  // Git management
  gitLoadRecents: (
    legacy?: Array<{ path: string; name: string }>,
  ): Promise<SharedRecentRepo[]> => ipcRenderer.invoke(IPC.GIT_LOAD_RECENTS, legacy),
  gitTouchRecent: (repo: GitRepo): Promise<SharedRecentRepo[]> =>
    ipcRenderer.invoke(IPC.GIT_TOUCH_RECENT, repo),
  gitRemoveRecent: (repoPath: string): Promise<SharedRecentRepo[]> =>
    ipcRenderer.invoke(IPC.GIT_REMOVE_RECENT, repoPath),
  gitSelectRepo: (): Promise<GitRepo | null> =>
    ipcRenderer.invoke(IPC.GIT_SELECT_REPO),
  gitGetRepoStatus: (repoPath: string): Promise<GitRepoStatus> =>
    ipcRenderer.invoke(IPC.GIT_GET_REPO_STATUS, repoPath),
  gitListWorktrees: (repoPath: string): Promise<GitWorktree[]> =>
    ipcRenderer.invoke(IPC.GIT_LIST_WORKTREES, repoPath),
  gitCreateWorktree: (opts: WorktreeCreateOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_CREATE_WORKTREE, opts),
  gitRemoveWorktree: (opts: WorktreeRemoveOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_REMOVE_WORKTREE, opts),
  gitCommitWorktree: (opts: WorktreeCommitOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_COMMIT_WORKTREE, opts),
  gitCheckoutBranch: (repoPath: string, branch: string): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_CHECKOUT_BRANCH, repoPath, branch),
  gitCreateBranch: (repoPath: string, name: string, startPoint?: string): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_CREATE_BRANCH, repoPath, name, startPoint),
  gitDeleteBranch: (repoPath: string, branch: string, force?: boolean): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_DELETE_BRANCH, repoPath, branch, force),
  gitMerge: (opts: MergeOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_MERGE, opts),
  gitPush: (opts: PushOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_PUSH, opts),
  gitFetch: (repoPath: string, remote?: string): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_FETCH, repoPath, remote),
  gitPull: (opts: UpdateOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_PULL, opts),
  gitStashCreate: (opts: StashCreateOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_STASH_CREATE, opts),
  gitStashApply: (opts: StashApplyOptions): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_STASH_APPLY, opts),
  gitStashDrop: (repoPath: string, stashIndex: number): Promise<GitOperationResult> =>
    ipcRenderer.invoke(IPC.GIT_STASH_DROP, repoPath, stashIndex),

  // Editor launchers
  openInEditor: (target: EditorTarget, path: string): Promise<EditorLaunchResult> =>
    ipcRenderer.invoke(IPC.EDITOR_OPEN, target, path),

  // Diffs
  getPRDiff: (prNumber: number, repoFullName: string): Promise<DiffResult> =>
    ipcRenderer.invoke(IPC.GITHUB_GET_PR_DIFF, prNumber, repoFullName),
  getWorktreeDiff: (worktreePath: string): Promise<WorktreeDiffResult> =>
    ipcRenderer.invoke(IPC.GIT_GET_WORKTREE_DIFF, worktreePath),

  // Settings (~/.gh-tools)
  settingsGet: (): Promise<import('@shared/settings').AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_GET),
  settingsSet: (patch: Partial<import('@shared/settings').AppSettings>): Promise<import('@shared/settings').AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_SET, patch),
};

export type ElectronAPI = typeof api;

contextBridge.exposeInMainWorld('electronAPI', api);
