import { app } from 'electron';
import started from 'electron-squirrel-startup';
import { APP_META, resolveAppTarget } from '@shared/app-meta';
import { runPrPulseApp } from './main/apps/pr-pulse';
import { runGitManagerApp } from './main/apps/git-manager';

if (started) {
  app.quit();
}

// __APP_TARGET__ is injected at build time by vite.main.config.ts and selects
// which of the two products this bundle boots as.
const target = resolveAppTarget(__APP_TARGET__);

// Set the name before requesting the singleton lock so each app gets its own
// lock path (userData is derived from the app name).
app.setName(APP_META[target].productName);

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

if (target === 'pr-pulse') {
  runPrPulseApp();
} else {
  runGitManagerApp();
}
