import { ipcMain } from 'electron';
import { IPC } from '@shared/ipc-channels';
import type { AppSettings } from '@shared/settings';
import { getSettings, loadSettings, saveSettings } from '../services/settings-store';

/** Registers IPC handlers for reading and writing ~/.gh-tools settings. */
export function registerSettingsIpc(): void {
  ipcMain.handle(IPC.SETTINGS_GET, async () => {
    await loadSettings();
    return getSettings();
  });

  ipcMain.handle(IPC.SETTINGS_SET, async (_event, patch: Partial<AppSettings>) => {
    return saveSettings(patch);
  });
}
