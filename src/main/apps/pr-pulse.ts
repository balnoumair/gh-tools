import { app, nativeImage } from 'electron';
import path from 'node:path';
import { createPopoverWindow, createReviewerWindow, getPopoverWindow, getReviewerWindow } from '../windows';
import { createTray } from '../tray';
import { getToken } from '../services/auth';
import {
  startPolling,
  stopPolling,
  setOnPRsUpdated,
} from '../services/github-poller';
import { loadShellPath } from '../services/editor-launcher';
import { registerPrIpc } from '../ipc/pr-ipc';
import { registerReviewerIpc } from '../ipc/reviewer-ipc';
import { IPC } from '@shared/ipc-channels';
import { APP_META } from '@shared/app-meta';

const meta = APP_META['pr-pulse'];

async function openReviewer(): Promise<void> {
  if (process.platform === 'darwin') {
    await app.dock?.show();
  }
  createReviewerWindow();
}

/** Boots the PR Pulse menubar app: tray + popover + GitHub polling. */
export function runPrPulseApp(): void {
  app.setName(meta.productName);

  // Menubar-only app — no dock presence until reviewer opens.
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../../assets/pr-pulse/icon.png');
    app.dock?.setIcon(nativeImage.createFromPath(iconPath));
    app.dock?.hide();
  }

  registerPrIpc();
  registerReviewerIpc();

  app.on('ready', async () => {
    await loadShellPath();

    createPopoverWindow();
    createTray(() => getPopoverWindow(), meta.productName, openReviewer);

    setOnPRsUpdated((prs) => {
      const popover = getPopoverWindow();
      if (popover && !popover.isDestroyed()) {
        popover.webContents.send(IPC.GITHUB_PRS_UPDATED, prs);
      }
      const reviewer = getReviewerWindow();
      if (reviewer && !reviewer.isDestroyed()) {
        reviewer.webContents.send(IPC.GITHUB_PRS_UPDATED, prs);
      }
    });

    const token = await getToken();
    if (token) {
      startPolling();
    }
  });

  // Tray app — stay alive when windows are closed.
  app.on('window-all-closed', () => {
    // no-op: keep running in the menu bar
  });

  app.on('before-quit', () => {
    stopPolling();
  });
}
