import { app } from 'electron';
import started from 'electron-squirrel-startup';
import { resolveAppTarget } from '@shared/app-meta';
import { runPrPulseApp } from './main/apps/pr-pulse';
import { runGitManagerApp } from './main/apps/git-manager';

if (started) {
  app.quit();
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

// __APP_TARGET__ is injected at build time by vite.main.config.ts and selects
// which of the two products this bundle boots as.
const target = resolveAppTarget(__APP_TARGET__);

if (target === 'pr-pulse') {
  runPrPulseApp();
} else {
  runGitManagerApp();
}
