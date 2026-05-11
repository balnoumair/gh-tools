import { app, ipcMain, shell } from 'electron';
import started from 'electron-squirrel-startup';
import { createTray } from './main/tray';
import { createPopoverWindow, createFullWindow, getPopoverWindow, setFullWindowSize } from './main/windows';
import { getToken, getAuthStatus } from './main/services/auth';
import {
  startPolling,
  stopPolling,
  refreshPRs,
  getCachedPRs,
  setOnPRsUpdated,
  setPollInterval,
} from './main/services/github-poller';
import * as gitService from './main/services/git-service';
import { loadShellPath, openInEditor } from './main/services/editor-launcher';
import { IPC } from '@shared/ipc-channels';
import type {
  EditorTarget,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
  WorktreeCreateOptions,
  WorktreeRemoveOptions,
  WorktreeCommitOptions,
} from '@shared/types';

if (started) {
  app.quit();
}

// Hide dock icon — this is a menu bar app
if (process.platform === 'darwin') {
  app.dock?.hide();
}

app.on('ready', async () => {
  await loadShellPath();

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

ipcMain.handle(IPC.GITHUB_SET_POLL_INTERVAL, async (_event, minutes: number) => {
  setPollInterval(minutes);
});

ipcMain.handle(IPC.APP_OPEN_FULL_WINDOW, async () => {
  createFullWindow();
});

ipcMain.handle(IPC.APP_OPEN_EXTERNAL, async (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle(IPC.APP_SET_WINDOW_SIZE, async (_event, width: number, height: number) => {
  setFullWindowSize(width, height);
});

// --- Git IPC Handlers ---

ipcMain.handle(IPC.GIT_SELECT_REPO, async () => {
  return gitService.selectRepo();
});

ipcMain.handle(IPC.GIT_GET_REPO_STATUS, async (_e, repoPath: string) => {
  return gitService.getRepoStatus(repoPath);
});

ipcMain.handle(IPC.GIT_LIST_WORKTREES, async (_e, repoPath: string) => {
  return gitService.listWorktrees(repoPath);
});

ipcMain.handle(IPC.GIT_CREATE_WORKTREE, async (_e, opts: WorktreeCreateOptions) => {
  return gitService.createWorktree(opts);
});

ipcMain.handle(IPC.GIT_REMOVE_WORKTREE, async (_e, opts: WorktreeRemoveOptions) => {
  return gitService.removeWorktree(opts);
});

ipcMain.handle(IPC.GIT_COMMIT_WORKTREE, async (_e, opts: WorktreeCommitOptions) => {
  return gitService.commitWorktree(opts);
});

ipcMain.handle(IPC.GIT_CHECKOUT_BRANCH, async (_e, repoPath: string, branch: string) => {
  return gitService.checkoutBranch(repoPath, branch);
});

ipcMain.handle(IPC.GIT_CREATE_BRANCH, async (_e, repoPath: string, name: string, startPoint?: string) => {
  return gitService.createBranch(repoPath, name, startPoint);
});

ipcMain.handle(IPC.GIT_DELETE_BRANCH, async (_e, repoPath: string, branch: string, force?: boolean) => {
  return gitService.deleteBranch(repoPath, branch, force);
});

ipcMain.handle(IPC.GIT_MERGE, async (_e, opts: MergeOptions) => {
  return gitService.merge(opts);
});

ipcMain.handle(IPC.GIT_PUSH, async (_e, opts: PushOptions) => {
  return gitService.push(opts);
});

ipcMain.handle(IPC.GIT_FETCH, async (_e, repoPath: string, remote?: string) => {
  return gitService.fetch(repoPath, remote);
});

ipcMain.handle(IPC.GIT_PULL, async (_e, opts: UpdateOptions) => {
  return gitService.pull(opts);
});

ipcMain.handle(IPC.GIT_STASH_CREATE, async (_e, opts: StashCreateOptions) => {
  return gitService.stashCreate(opts);
});

ipcMain.handle(IPC.GIT_STASH_APPLY, async (_e, opts: StashApplyOptions) => {
  return gitService.stashApply(opts);
});

ipcMain.handle(IPC.GIT_STASH_DROP, async (_e, repoPath: string, stashIndex: number) => {
  return gitService.stashDrop(repoPath, stashIndex);
});

ipcMain.handle(IPC.EDITOR_OPEN, async (_e, target: EditorTarget, targetPath: string) => {
  return openInEditor(target, targetPath);
});

app.on('before-quit', () => {
  stopPolling();
});
