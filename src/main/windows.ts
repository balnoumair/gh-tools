import { BrowserWindow } from 'electron';
import path from 'node:path';
import type { GitRepo } from '@shared/types';

let popoverWindow: BrowserWindow | null = null;
let fullWindow: BrowserWindow | null = null;
let reviewerWindow: BrowserWindow | null = null;

function fullWindowQuery(repo?: GitRepo): Record<string, string> {
  const query: Record<string, string> = { mode: 'full' };
  if (repo) {
    query.repoPath = repo.path;
    query.repoName = repo.name;
  }
  return query;
}

function getRendererUrl(mode: 'tray' | 'full', repo?: GitRepo): string {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const params = new URLSearchParams({ mode });
    if (repo && mode === 'full') {
      params.set('repoPath', repo.path);
      params.set('repoName', repo.name);
    }
    return `${MAIN_WINDOW_VITE_DEV_SERVER_URL}?${params.toString()}`;
  }
  return ''; // handled by loadFile below
}

function getRendererFilePath(): string {
  return path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
}

export function createPopoverWindow(): BrowserWindow {
  if (popoverWindow && !popoverWindow.isDestroyed()) {
    return popoverWindow;
  }

  popoverWindow = new BrowserWindow({
    width: 380,
    height: 520,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    transparent: process.platform === 'darwin',
    backgroundColor: '#00000000',
    vibrancy: process.platform === 'darwin' ? 'menu' : undefined,
    visualEffectState: 'active',
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    popoverWindow.loadURL(getRendererUrl('tray'));
  } else {
    popoverWindow.loadFile(getRendererFilePath(), {
      query: { mode: 'tray' },
    });
  }

  popoverWindow.on('blur', () => {
    popoverWindow?.hide();
  });

  popoverWindow.on('closed', () => {
    popoverWindow = null;
  });

  return popoverWindow;
}

export function createFullWindow(repo?: GitRepo): BrowserWindow {
  if (fullWindow && !fullWindow.isDestroyed()) {
    fullWindow.show();
    fullWindow.focus();
    return fullWindow;
  }

  fullWindow = new BrowserWindow({
    width: 380,
    height: 680,
    minWidth: 380,
    maxWidth: 380,
    minHeight: 480,
    show: false,
    frame: true,
    resizable: true,
    titleBarStyle: 'hiddenInset',
    transparent: true,
    backgroundColor: '#00000000',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    fullWindow.loadURL(getRendererUrl('full', repo));
  } else {
    fullWindow.loadFile(getRendererFilePath(), {
      query: fullWindowQuery(repo),
    });
  }

  fullWindow.once('ready-to-show', () => {
    fullWindow?.show();
  });

  fullWindow.on('closed', () => {
    fullWindow = null;
  });

  return fullWindow;
}

export function createReviewerWindow(): BrowserWindow {
  if (reviewerWindow && !reviewerWindow.isDestroyed()) {
    reviewerWindow.show();
    reviewerWindow.focus();
    return reviewerWindow;
  }

  reviewerWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    reviewerWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}?mode=reviewer`);
  } else {
    reviewerWindow.loadFile(getRendererFilePath(), { query: { mode: 'reviewer' } });
  }

  reviewerWindow.once('ready-to-show', () => {
    reviewerWindow?.show();
  });

  reviewerWindow.on('closed', () => {
    reviewerWindow = null;
  });

  return reviewerWindow;
}

export function getPopoverWindow(): BrowserWindow | null {
  return popoverWindow;
}

export function getFullWindow(): BrowserWindow | null {
  return fullWindow;
}

export function getReviewerWindow(): BrowserWindow | null {
  return reviewerWindow;
}

export function setFullWindowSize(width: number, height: number): void {
  if (!fullWindow || fullWindow.isDestroyed()) return;

  fullWindow.setResizable(width !== 380);
  fullWindow.setMinimumSize(380, 480);

  if (width === 380) {
    fullWindow.setMaximumSize(380, 9999);
  } else {
    fullWindow.setMaximumSize(9999, 9999);
  }

  fullWindow.setContentSize(width, height);
}
