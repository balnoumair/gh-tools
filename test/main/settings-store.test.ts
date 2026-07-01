import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, SETTINGS_FILE_NAME } from '@shared/settings';

describe('settings-store', () => {
  let tempHome = '';

  beforeEach(async () => {
    tempHome = await fs.mkdtemp(path.join(os.tmpdir(), 'ghv-settings-'));
    vi.spyOn(os, 'homedir').mockReturnValue(tempHome);
    vi.resetModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tempHome, { recursive: true, force: true });
  });

  it('writes and reads ~/.gh-tools settings', async () => {
    const { saveSettings } = await import('../../src/main/services/settings-store');

    await saveSettings({
      notifier: {
        interval: '1m',
        notifySound: true,
        hiddenRepos: { 'acme/secret': true },
      },
      review: {
        commands: { push: 'git push -u origin HEAD' },
        openRoots: { '/tmp/repo-a': false },
        prSectionsOpen: { '/tmp/repo-a': false },
      },
    });

    const file = await fs.readFile(path.join(tempHome, SETTINGS_FILE_NAME), 'utf8');
    expect(JSON.parse(file).notifier.interval).toBe('1m');

    vi.resetModules();
    const reloaded = await import('../../src/main/services/settings-store');
    await reloaded.loadSettings();
    expect(reloaded.getSettings().notifier.interval).toBe('1m');
    expect(reloaded.getSettings().review.commands.push).toBe('git push -u origin HEAD');
    expect(reloaded.getSettings().review.openRoots['/tmp/repo-a']).toBe(false);
    expect(reloaded.getSettings().review.prSectionsOpen['/tmp/repo-a']).toBe(false);
    expect(reloaded.getSettings().notifier.hiddenRepos['acme/secret']).toBe(true);
    expect(reloaded.getSettings().notifier.notifyReview).toBe(DEFAULT_SETTINGS.notifier.notifyReview);
  });
});
