import { app, BrowserWindow } from 'electron';
import { applyDockIcon } from './dock-icon';
import { createFullWindow, getFullWindow } from './windows';
import { touchSharedRecent } from './services/recents-store';
import { IPC } from '@shared/ipc-channels';
import type { GitRepo } from '@shared/types';

function showDockForFullWindow(): void {
  if (process.platform === 'darwin') {
    app.dock?.show();
    applyDockIcon();
  }
}

function sendOpenRepo(win: BrowserWindow, repo: GitRepo): void {
  if (win.isDestroyed()) return;
  win.webContents.send(IPC.APP_OPEN_REPO, repo);
}

/** Opens (or focuses) the Git Manager window on the repo picker (no repo selected). */
export function openFullWindowPicker(): void {
  showDockForFullWindow();

  const existing = getFullWindow();
  if (existing && !existing.isDestroyed()) {
    existing.show();
    existing.focus();
    return;
  }

  createFullWindow();
}

/** Opens (or focuses) the Git Manager window and loads the given repository. */
export async function openRepoInFullWindow(repo: GitRepo): Promise<void> {
  await touchSharedRecent(repo);
  showDockForFullWindow();

  const existing = getFullWindow();
  if (existing && !existing.isDestroyed()) {
    existing.show();
    existing.focus();
    sendOpenRepo(existing, repo);
    return;
  }

  const win = createFullWindow(repo);
  const deliver = () => sendOpenRepo(win, repo);

  if (win.webContents.isLoading()) {
    win.webContents.once('did-finish-load', deliver);
  } else {
    deliver();
  }
}
