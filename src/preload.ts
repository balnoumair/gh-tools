import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@shared/ipc-channels';
import type {
  PullRequest,
  AuthStatus,
  GitRepo,
  GitRepoStatus,
  GitOperationResult,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
} from '@shared/types';

const api = {
  // GitHub
  getPRs: (): Promise<PullRequest[]> =>
    ipcRenderer.invoke(IPC.GITHUB_GET_PRS),
  forceRefresh: (): Promise<PullRequest[]> =>
    ipcRenderer.invoke(IPC.GITHUB_FORCE_REFRESH),
  getAuthStatus: (): Promise<AuthStatus> =>
    ipcRenderer.invoke(IPC.GITHUB_GET_AUTH_STATUS),
  setToken: (token: string): Promise<AuthStatus> =>
    ipcRenderer.invoke(IPC.GITHUB_SET_TOKEN, token),
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
  openFullWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC.APP_OPEN_FULL_WINDOW),
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC.APP_OPEN_EXTERNAL, url),

  // Git management
  gitSelectRepo: (): Promise<GitRepo | null> =>
    ipcRenderer.invoke(IPC.GIT_SELECT_REPO),
  gitGetRepoStatus: (repoPath: string): Promise<GitRepoStatus> =>
    ipcRenderer.invoke(IPC.GIT_GET_REPO_STATUS, repoPath),
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
};

export type ElectronAPI = typeof api;

contextBridge.exposeInMainWorld('electronAPI', api);
