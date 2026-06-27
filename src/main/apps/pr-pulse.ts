import { app, nativeImage } from 'electron';
import path from 'node:path';
import { createPopoverWindow, getPopoverWindow } from '../windows';
import { createTray } from '../tray';
import { getToken } from '../services/auth';
import { startPolling, stopPolling, setOnPRsUpdated } from '../services/github-poller';
import { loadShellPath } from '../services/editor-launcher';
import { registerPrIpc } from '../ipc/pr-ipc';
import { registerGitIpc } from '../ipc/git-ipc';
import {
  openFullWindowPicker,
  openRepoInFullWindow,
} from '../full-window';
import {
  extractDeepLinksFromArgv,
  GH_VIEWER_PROTOCOL,
  parseRepoDeepLink,
} from '@shared/deep-link';
import { IPC } from '@shared/ipc-channels';
import { APP_META } from '@shared/app-meta';
import type { GitRepo } from '@shared/types';

const meta = APP_META['pr-pulse'];

let appIsReady = false;
let pendingRepoOpen: GitRepo | null = null;

function handleDeepLink(rawUrl: string): void {
  const repo = parseRepoDeepLink(rawUrl);
  if (!repo) return;

  if (!appIsReady) {
    pendingRepoOpen = repo;
    return;
  }

  void openRepoInFullWindow(repo);
}

function drainArgvDeepLinks(argv: string[]): void {
  for (const url of extractDeepLinksFromArgv(argv)) {
    handleDeepLink(url);
  }
}

async function openPulseDesktop(): Promise<void> {
  if (process.platform === 'darwin') {
    await app.dock?.show();
  }
  openFullWindowPicker();
}

/** Boots the Pulse app: tray + popover + GitHub polling + git workspace. */
export function runPrPulseApp(): void {
  app.setName(meta.productName);

  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../../assets/pr-pulse/icon.png');
    app.dock?.setIcon(nativeImage.createFromPath(iconPath));
    app.dock?.hide();
  }

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(
        GH_VIEWER_PROTOCOL,
        process.execPath,
        [path.resolve(process.argv[1])],
      );
    }
  } else {
    app.setAsDefaultProtocolClient(GH_VIEWER_PROTOCOL);
  }

  app.on('second-instance', (_event, argv) => {
    drainArgvDeepLinks(argv);
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  registerPrIpc();
  registerGitIpc();

  app.on('ready', async () => {
    appIsReady = true;
    await loadShellPath();

    createPopoverWindow();
    createTray(() => getPopoverWindow(), meta.productName, openPulseDesktop);

    setOnPRsUpdated((prs) => {
      const popover = getPopoverWindow();
      if (popover && !popover.isDestroyed()) {
        popover.webContents.send(IPC.GITHUB_PRS_UPDATED, prs);
      }
    });

    drainArgvDeepLinks(process.argv);
    if (pendingRepoOpen) {
      const repo = pendingRepoOpen;
      pendingRepoOpen = null;
      void openRepoInFullWindow(repo);
    }

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
