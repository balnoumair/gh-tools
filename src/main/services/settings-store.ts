import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  DEFAULT_SETTINGS,
  SETTINGS_FILE_NAME,
  mergeSettings,
  parseSettings,
  type AppSettings,
} from '@shared/settings';
import { applyNotifierSettings } from './apply-settings';

function settingsFilePath(): string {
  return path.join(os.homedir(), SETTINGS_FILE_NAME);
}

let cache: AppSettings = structuredClone(DEFAULT_SETTINGS);

export function getSettings(): AppSettings {
  return cache;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(settingsFilePath(), 'utf8');
    cache = parseSettings(JSON.parse(raw) as unknown);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.error('[settings] Failed to read settings file:', err);
    }
    cache = structuredClone(DEFAULT_SETTINGS);
  }

  applyNotifierSettings(cache.notifier);
  return cache;
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  cache = mergeSettings(cache, patch);
  await fs.writeFile(settingsFilePath(), `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
  if (patch.notifier) {
    applyNotifierSettings(cache.notifier);
  }
  return cache;
}
