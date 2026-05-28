import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { openFullWindowPicker, openRepoInFullWindow } from '../full-window';
import { getFullWindow } from '../windows';
import { loadShellPath } from '../services/editor-launcher';
import { registerGitIpc } from '../ipc/git-ipc';
import {
  extractDeepLinksFromArgv,
  GH_VIEWER_PROTOCOL,
  parseRepoDeepLink,
} from '@shared/deep-link';
import { APP_META } from '@shared/app-meta';
import type { GitRepo } from '@shared/types';

const meta = APP_META['git-manager'];

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

/** Boots the Git Manager (project management) app: full window + git tooling. */
export function runGitManagerApp(): void {
  app.setName(meta.productName);

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

  registerGitIpc();

  app.on('ready', async () => {
    appIsReady = true;
    await loadShellPath();

    drainArgvDeepLinks(process.argv);
    if (pendingRepoOpen) {
      const repo = pendingRepoOpen;
      pendingRepoOpen = null;
      void openRepoInFullWindow(repo);
    } else {
      openFullWindowPicker();
    }
  });

  // Re-open the window when the user clicks the dock icon with no window open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      openFullWindowPicker();
    } else {
      const existing = getFullWindow();
      existing?.show();
      existing?.focus();
    }
  });

  // Standard windowed-app behavior: quit when the last window closes
  // (except on macOS, where apps conventionally stay running in the dock).
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
