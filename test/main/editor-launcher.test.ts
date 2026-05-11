import { promisify } from 'node:util';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const accessMock = vi.fn();
const spawnMock = vi.fn(() => ({ unref: vi.fn() }));
const execFileAsyncMock = vi.fn();
const execFileMock = vi.fn() as any;
execFileMock[promisify.custom] = (...args: unknown[]) => execFileAsyncMock(...args);

vi.mock('node:fs/promises', () => ({
  access: accessMock,
  default: {
    access: accessMock,
  },
}));

vi.mock('node:child_process', () => ({
  spawn: spawnMock,
  execFile: execFileMock,
  default: {
    spawn: spawnMock,
    execFile: execFileMock,
  },
}));

describe('editor-launcher', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    accessMock.mockResolvedValue(undefined);
    execFileAsyncMock.mockResolvedValue({ stdout: '/usr/local/bin/cursor\n' });
  });

  it('spawns an installed CLI target detached', async () => {
    const { openInEditor } = await import('../../src/main/services/editor-launcher');

    const result = await openInEditor('cursor', '/repo');

    expect(result).toEqual({ success: true, message: 'Opened in cursor' });
    expect(execFileAsyncMock).toHaveBeenCalledWith('which', ['cursor'], expect.any(Object));
    expect(spawnMock).toHaveBeenCalledWith('cursor', ['/repo'], expect.objectContaining({
      detached: true,
      stdio: 'ignore',
    }));
  });

  it('returns a clear error when the binary is missing', async () => {
    execFileAsyncMock.mockRejectedValueOnce(new Error('missing'));
    const { openInEditor } = await import('../../src/main/services/editor-launcher');

    const result = await openInEditor('zed', '/repo');

    expect(result.success).toBe(false);
    expect(result.message).toContain('zed');
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('returns a clear error when the path does not exist', async () => {
    accessMock.mockRejectedValueOnce(new Error('missing path'));
    const { openInEditor } = await import('../../src/main/services/editor-launcher');

    const result = await openInEditor('cursor', '/missing');

    expect(result.success).toBe(false);
    expect(result.message).toContain('/missing');
    expect(spawnMock).not.toHaveBeenCalled();
  });
});
