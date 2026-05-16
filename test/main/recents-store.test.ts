import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('recents-store', () => {
  let tempHome = '';

  beforeEach(async () => {
    tempHome = await fs.mkdtemp(path.join(os.tmpdir(), 'ghv-recents-'));
    vi.spyOn(os, 'homedir').mockReturnValue(tempHome);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tempHome, { recursive: true, force: true });
  });

  it('writes and reads shared recents', async () => {
    const { touchSharedRecent, loadSharedRecents, removeSharedRecent } = await import(
      '../../src/main/services/recents-store'
    );

    await touchSharedRecent({ path: '/tmp/repo-a', name: 'repo-a' });
    await touchSharedRecent({ path: '/tmp/repo-b', name: 'repo-b' });

    let recents = await loadSharedRecents();
    expect(recents.map((r) => r.name)).toEqual(['repo-b', 'repo-a']);

    recents = await removeSharedRecent('/tmp/repo-a');
    expect(recents.map((r) => r.name)).toEqual(['repo-b']);
  });
});
