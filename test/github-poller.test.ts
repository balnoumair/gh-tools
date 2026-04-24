import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getTokenMock = vi.fn();
const showPRNotificationMock = vi.fn();
const searchMock = vi.fn();
const octokitCtorMock = vi.fn(() => ({
  rest: {
    search: {
      issuesAndPullRequests: searchMock,
    },
  },
}));

vi.mock('../src/main/services/auth', () => ({
  getToken: getTokenMock,
}));

vi.mock('../src/main/services/notifications', () => ({
  showPRNotification: showPRNotificationMock,
}));

vi.mock('@octokit/rest', () => ({
  Octokit: octokitCtorMock,
}));

function issueItem(id: number, updatedAt: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    number: id,
    title: `PR ${id}`,
    html_url: `https://github.com/org/repo/pull/${id}`,
    url: `https://api.github.com/repos/org/repo/pulls/${id}`,
    repository_url: 'https://api.github.com/repos/org/repo',
    user: { login: 'octocat', avatar_url: 'https://example.com/avatar.png' },
    labels: [{ name: 'ready', color: '00ff00' }],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: updatedAt,
    ...overrides,
  };
}

function searchResponse(items: unknown[], etag?: string) {
  return {
    data: { items },
    headers: etag ? { etag } : {},
  };
}

describe('github-poller', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getTokenMock.mockResolvedValue('token-123');
  });

  afterEach(async () => {
    const poller = await import('../src/main/services/github-poller');
    poller.stopPolling();
    poller.resetOctokit();
  });

  it('deduplicates PRs and sorts by most recently updated', async () => {
    searchMock
      .mockResolvedValueOnce(
        searchResponse(
          [
            issueItem(1, '2026-03-01T00:00:00.000Z'),
            issueItem(2, '2026-03-02T00:00:00.000Z'),
          ],
          '"etag-1"'
        )
      )
      .mockResolvedValueOnce(searchResponse([issueItem(2, '2026-03-02T00:00:00.000Z')]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([issueItem(3, '2026-03-03T00:00:00.000Z')]));

    const poller = await import('../src/main/services/github-poller');
    const prs = await poller.refreshPRs();

    expect(prs.map((pr) => pr.id)).toEqual([3, 2, 1]);
    expect(prs.find((pr) => pr.id === 2)?.mentionType).toBe('review_requested');
    expect(poller.getCachedPRs()).toEqual(prs);
  });

  it('uses ETag on subsequent refresh calls', async () => {
    searchMock
      .mockResolvedValueOnce(searchResponse([issueItem(1, '2026-03-01T00:00:00.000Z')], '"etag-2"'))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([issueItem(1, '2026-03-01T00:00:00.000Z')]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]));

    const poller = await import('../src/main/services/github-poller');
    await poller.refreshPRs();
    await poller.refreshPRs();

    const secondRefreshFirstQueryArgs = searchMock.mock.calls[4]?.[0];
    expect(secondRefreshFirstQueryArgs.headers).toEqual({ 'If-None-Match': '"etag-2"' });
  });

  it('notifies only for newly seen PR ids', async () => {
    searchMock
      .mockResolvedValueOnce(searchResponse([issueItem(1, '2026-03-01T00:00:00.000Z')]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(
        searchResponse([
          issueItem(1, '2026-03-01T00:00:00.000Z'),
          issueItem(2, '2026-03-02T00:00:00.000Z'),
        ])
      )
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]));

    const poller = await import('../src/main/services/github-poller');
    await poller.refreshPRs();
    await poller.refreshPRs();

    expect(showPRNotificationMock).toHaveBeenCalledTimes(1);
    expect(showPRNotificationMock.mock.calls[0][0].id).toBe(2);
  });

  it('returns cached PRs when fetch fails', async () => {
    searchMock
      .mockResolvedValueOnce(searchResponse([issueItem(7, '2026-03-07T00:00:00.000Z')]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([]))
      .mockRejectedValueOnce(new Error('github down'));

    const poller = await import('../src/main/services/github-poller');
    const initial = await poller.refreshPRs();
    const fallback = await poller.refreshPRs();

    expect(initial.map((pr) => pr.id)).toEqual([7]);
    expect(fallback.map((pr) => pr.id)).toEqual([7]);
  });

  it('clamps poll interval boundaries', async () => {
    searchMock.mockResolvedValue(searchResponse([]));

    const intervalFn = vi.fn(() => 123 as unknown as ReturnType<typeof setInterval>);
    const clearIntervalFn = vi.fn();
    vi.stubGlobal('setInterval', intervalFn);
    vi.stubGlobal('clearInterval', clearIntervalFn);
    const poller = await import('../src/main/services/github-poller');

    poller.setPollInterval(0);
    await poller.startPolling();
    poller.stopPolling();

    poller.setPollInterval(100);
    await poller.startPolling();
    poller.stopPolling();

    expect(intervalFn).toHaveBeenCalled();
    const setIntervalDelays = intervalFn.mock.calls.map((call) => call[1] as number);
    expect(setIntervalDelays).toContain(60_000);
    expect(setIntervalDelays).toContain(3_600_000);
    expect(clearIntervalFn).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
