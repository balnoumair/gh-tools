import { app, ipcMain, shell } from 'electron';
import started from 'electron-squirrel-startup';
import { createTray } from './main/tray';
import { createPopoverWindow, createFullWindow, getPopoverWindow } from './main/windows';
import { getToken, getAuthStatus, setManualToken } from './main/services/auth';
import {
  startPolling,
  stopPolling,
  refreshPRs,
  getCachedPRs,
  setOnPRsUpdated,
  setPollInterval,
} from './main/services/github-poller';
import { IPC } from '@shared/ipc-channels';

if (started) {
  app.quit();
}

// Hide dock icon — this is a menu bar app
if (process.platform === 'darwin') {
  app.dock?.hide();
}

app.on('ready', async () => {
  // Create popover window first, then tray
  createPopoverWindow();
  createTray(() => getPopoverWindow());

  // Set up IPC push for PR updates
  setOnPRsUpdated((prs) => {
    const popover = getPopoverWindow();
    if (popover && !popover.isDestroyed()) {
      popover.webContents.send(IPC.GITHUB_PRS_UPDATED, prs);
    }
  });

  // Start polling if authenticated
  const token = await getToken();
  if (token) {
    startPolling();
  }
});

// Keep app alive when all windows closed (tray app)
app.on('window-all-closed', () => {
  // Don't quit — we're a tray app
});

// --- IPC Handlers ---

ipcMain.handle(IPC.GITHUB_GET_PRS, async () => {
  return getCachedPRs();
});

ipcMain.handle(IPC.GITHUB_FORCE_REFRESH, async () => {
  return refreshPRs();
});

ipcMain.handle(IPC.GITHUB_GET_AUTH_STATUS, async () => {
  return getAuthStatus();
});

ipcMain.handle(IPC.GITHUB_SET_TOKEN, async (_event, token: string) => {
  await setManualToken(token);
  startPolling();
  return getAuthStatus();
});

ipcMain.handle(IPC.GITHUB_SET_POLL_INTERVAL, async (_event, minutes: number) => {
  setPollInterval(minutes);
});

ipcMain.handle(IPC.APP_OPEN_FULL_WINDOW, async () => {
  createFullWindow();
});

ipcMain.handle(IPC.APP_OPEN_EXTERNAL, async (_event, url: string) => {
  shell.openExternal(url);
});

app.on('before-quit', () => {
  stopPolling();
});
