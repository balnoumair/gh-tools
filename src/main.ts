import { app } from 'electron';
import started from 'electron-squirrel-startup';
import { APP_META } from '@shared/app-meta';
import { runPrPulseApp } from './main/apps/pr-pulse';

if (started) {
  app.quit();
}

app.setName(APP_META['pr-pulse'].productName);

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

runPrPulseApp();
