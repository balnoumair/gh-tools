import { ipcMain, shell } from 'electron';
import { getAuthStatus } from '../services/auth';
import {
  refreshPRs,
  getCachedPRs,
  setPollInterval,
} from '../services/github-poller';
import { IPC } from '@shared/ipc-channels';

/** Registers all IPC handlers used by the PR Pulse (menubar notifications) app. */
export function registerPrIpc(): void {
  ipcMain.handle(IPC.GITHUB_GET_PRS, async () => {
    return getCachedPRs();
  });

  ipcMain.handle(IPC.GITHUB_FORCE_REFRESH, async () => {
    return refreshPRs();
  });

  ipcMain.handle(IPC.GITHUB_GET_AUTH_STATUS, async () => {
    return getAuthStatus();
  });

  ipcMain.handle(IPC.GITHUB_SET_POLL_INTERVAL, async (_event, minutes: number) => {
    setPollInterval(minutes);
  });

  ipcMain.handle(IPC.APP_OPEN_EXTERNAL, async (_event, url: string) => {
    shell.openExternal(url);
  });
}
