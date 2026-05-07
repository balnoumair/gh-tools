import { beforeEach, describe, expect, it, vi } from 'vitest';
import { promisify } from 'node:util';

const execFileAsyncMock = vi.fn();
const execFileMock = vi.fn() as any;
execFileMock[promisify.custom] = (...args: unknown[]) => execFileAsyncMock(...args);

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
  default: {
    execFile: execFileMock,
  },
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns gh CLI token and caches it', async () => {
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

  it('reports unauthenticated when gh CLI fails', async () => {
    execFileAsyncMock.mockRejectedValueOnce(new Error('gh unavailable'));

    const auth = await import('../src/main/services/auth');
    const token = await auth.getToken();
    const status = await auth.getAuthStatus();

    expect(token).toBeNull();
    expect(status).toEqual({
      authenticated: false,
      username: null,
      source: null,
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
