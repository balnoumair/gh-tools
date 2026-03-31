import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@shared/ipc-channels';
import type { PullRequest, AuthStatus } from '@shared/types';

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
};

export type ElectronAPI = typeof api;

contextBridge.exposeInMainWorld('electronAPI', api);
