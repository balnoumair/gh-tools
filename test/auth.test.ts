import { beforeEach, describe, expect, it, vi } from 'vitest';
import { promisify } from 'node:util';

const execFileAsyncMock = vi.fn();
const execFileMock = vi.fn() as any;
execFileMock[promisify.custom] = (...args: unknown[]) => execFileAsyncMock(...args);
const decryptStringMock = vi.fn();
const encryptStringMock = vi.fn((v: string) => Buffer.from(`enc:${v}`));
const isEncryptionAvailableMock = vi.fn();
const getPathMock = vi.fn(() => '/tmp/gh-viewer');

const existsSyncMock = vi.fn();
const readFileSyncMock = vi.fn();
const mkdirSyncMock = vi.fn();
const writeFileSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
  default: {
    execFile: execFileMock,
  },
}));

vi.mock('electron', () => ({
  safeStorage: {
    decryptString: decryptStringMock,
    encryptString: encryptStringMock,
    isEncryptionAvailable: isEncryptionAvailableMock,
  },
  app: {
    getPath: getPathMock,
  },
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: readFileSyncMock,
    mkdirSync: mkdirSyncMock,
    writeFileSync: writeFileSyncMock,
  },
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isEncryptionAvailableMock.mockReturnValue(true);
  });

  it('prefers gh CLI token and caches it', async () => {
    execFileAsyncMock
      .mockResolvedValueOnce({ stdout: 'gh-token\n' })
      .mockResolvedValueOnce({ stdout: 'octocat\n' });

    const auth = await import('../src/main/services/auth');

    const first = await auth.getToken();
    const second = await auth.getToken();
    const status = await auth.getAuthStatus();

    expect(first).toBe('gh-token');
    expect(second).toBe('gh-token');
    expect(execFileAsyncMock).toHaveBeenCalledTimes(2);
    expect(status).toEqual({
      authenticated: true,
      username: 'octocat',
      source: 'gh-cli',
    });
  });

  it('falls back to stored manual token when gh CLI fails', async () => {
    execFileAsyncMock.mockRejectedValueOnce(new Error('gh unavailable'));
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(Buffer.from('encrypted'));
    decryptStringMock.mockReturnValue('manual-token');

    const auth = await import('../src/main/services/auth');
    const token = await auth.getToken();
    const status = await auth.getAuthStatus();

    expect(token).toBe('manual-token');
    expect(status).toEqual({
      authenticated: true,
      username: null,
      source: 'manual',
    });
  });

  it('setManualToken persists encrypted token and updates cache', async () => {
    const auth = await import('../src/main/services/auth');

    await auth.setManualToken('new-token');
    const status = await auth.getAuthStatus();

    expect(mkdirSyncMock).toHaveBeenCalledWith('/tmp/gh-viewer', { recursive: true });
    expect(writeFileSyncMock).toHaveBeenCalled();
    expect(status).toEqual({
      authenticated: true,
      username: null,
      source: 'manual',
    });
  });

  it('clearCache resets cached auth state', async () => {
    execFileAsyncMock
      .mockResolvedValueOnce({ stdout: 'token-a\n' })
      .mockResolvedValueOnce({ stdout: 'octocat\n' })
      .mockResolvedValueOnce({ stdout: 'token-b\n' })
      .mockResolvedValueOnce({ stdout: 'hubot\n' });

    const auth = await import('../src/main/services/auth');
    await auth.getToken();
    auth.clearCache();
    const tokenAfterReset = await auth.getToken();

    expect(tokenAfterReset).toBe('token-b');
  });
});
