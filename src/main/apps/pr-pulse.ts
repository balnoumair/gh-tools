import { app } from 'electron';
import { createPopoverWindow, getPopoverWindow } from '../windows';
import { createTray } from '../tray';
import { getToken } from '../services/auth';
import {
  startPolling,
  stopPolling,
  setOnPRsUpdated,
} from '../services/github-poller';
import { loadShellPath } from '../services/editor-launcher';
import { registerPrIpc } from '../ipc/pr-ipc';
import { IPC } from '@shared/ipc-channels';
import { APP_META } from '@shared/app-meta';

const meta = APP_META['pr-pulse'];

/** Boots the PR Pulse menubar app: tray + popover + GitHub polling. */
export function runPrPulseApp(): void {
  app.setName(meta.productName);

  // Menubar-only app — no dock presence.
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  registerPrIpc();

  app.on('ready', async () => {
    await loadShellPath();

    createPopoverWindow();
    createTray(() => getPopoverWindow(), meta.productName);

    setOnPRsUpdated((prs) => {
      const popover = getPopoverWindow();
      if (popover && !popover.isDestroyed()) {
        popover.webContents.send(IPC.GITHUB_PRS_UPDATED, prs);
      }
    });

    const token = await getToken();
    if (token) {
      startPolling();
    }
  });

  // Tray app — stay alive when the popover is dismissed.
  app.on('window-all-closed', () => {
    // no-op: keep running in the menu bar
  });

  app.on('before-quit', () => {
    stopPolling();
  });
}
