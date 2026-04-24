import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IPC } from '../src/shared/ipc-channels';

const exposeInMainWorldMock = vi.fn();
const invokeMock = vi.fn();
const onMock = vi.fn();
const removeListenerMock = vi.fn();

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: exposeInMainWorldMock,
  },
  ipcRenderer: {
    invoke: invokeMock,
    on: onMock,
    removeListener: removeListenerMock,
  },
}));

describe('preload API wiring', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('exposes API and invokes expected IPC channels', async () => {
    await import('../src/preload');

    expect(exposeInMainWorldMock).toHaveBeenCalledOnce();
    const [, api] = exposeInMainWorldMock.mock.calls[0];

    await api.getPRs();
    await api.forceRefresh();
    await api.setToken('abc');
    await api.openExternal('https://example.com');
    await api.gitCheckoutBranch('/repo', 'feature');

    expect(invokeMock).toHaveBeenCalledWith(IPC.GITHUB_GET_PRS);
    expect(invokeMock).toHaveBeenCalledWith(IPC.GITHUB_FORCE_REFRESH);
    expect(invokeMock).toHaveBeenCalledWith(IPC.GITHUB_SET_TOKEN, 'abc');
    expect(invokeMock).toHaveBeenCalledWith(IPC.APP_OPEN_EXTERNAL, 'https://example.com');
    expect(invokeMock).toHaveBeenCalledWith(IPC.GIT_CHECKOUT_BRANCH, '/repo', 'feature');
  });

  it('registers and unregisters PR update listeners', async () => {
    await import('../src/preload');
    const [, api] = exposeInMainWorldMock.mock.calls[0];
    const callback = vi.fn();

    const unsubscribe = api.onPRsUpdated(callback);
    const handler = onMock.mock.calls[0][1];

    handler({}, [{ id: 1 }]);
    unsubscribe();

    expect(onMock).toHaveBeenCalledWith(IPC.GITHUB_PRS_UPDATED, expect.any(Function));
    expect(callback).toHaveBeenCalledWith([{ id: 1 }]);
    expect(removeListenerMock).toHaveBeenCalledWith(IPC.GITHUB_PRS_UPDATED, handler);
  });
});
