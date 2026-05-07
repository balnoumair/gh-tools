import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promisify } from 'node:util';

const getTokenMock = vi.fn();
const showPRNotificationMock = vi.fn();
const execFileAsyncMock = vi.fn();
const execFileMock = vi.fn() as any;
execFileMock[promisify.custom] = (...args: unknown[]) => execFileAsyncMock(...args);

vi.mock('../src/main/services/auth', () => ({
  getToken: getTokenMock,
}));

vi.mock('../src/main/services/notifications', () => ({
  showPRNotification: showPRNotificationMock,
}));

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
  default: { execFile: execFileMock },
}));

interface PrFixtureOverrides {
  number?: number;
  title?: string;
  url?: string;
  rollupState?: string | null;
  repoFullName?: string;
}

function prNode(id: number, updatedAt: string, overrides: PrFixtureOverrides = {}) {
  return {
    databaseId: id,
    number: overrides.number ?? id,
    title: overrides.title ?? `PR ${id}`,
    url: overrides.url ?? `https://github.com/org/repo/pull/${id}`,
    updatedAt,
    author: { login: 'octocat', avatarUrl: 'https://example.com/avatar.png' },
    repository: { nameWithOwner: overrides.repoFullName ?? 'org/repo' },
    commits: {
      nodes: [
        {
          commit: {
            statusCheckRollup: overrides.rollupState
              ? { state: overrides.rollupState }
              : null,
          },
        },
      ],
    },
  };
}

function gqlResponse(buckets: {
  reviewRequested?: ReturnType<typeof prNode>[];
  mentioned?: ReturnType<typeof prNode>[];
  assigned?: ReturnType<typeof prNode>[];
  authored?: ReturnType<typeof prNode>[];
}) {
  return {
    stdout: JSON.stringify({
      data: {
        reviewRequested: { nodes: buckets.reviewRequested ?? [] },
        mentioned: { nodes: buckets.mentioned ?? [] },
        assigned: { nodes: buckets.assigned ?? [] },
        authored: { nodes: buckets.authored ?? [] },
      },
    }),
    stderr: '',
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
  });

  it('deduplicates PRs and sorts by most recently updated', async () => {
    execFileAsyncMock.mockResolvedValueOnce(
      gqlResponse({
        reviewRequested: [
          prNode(1, '2026-03-01T00:00:00.000Z'),
          prNode(2, '2026-03-02T00:00:00.000Z'),
        ],
        mentioned: [prNode(2, '2026-03-02T00:00:00.000Z')],
        assigned: [],
        authored: [prNode(3, '2026-03-03T00:00:00.000Z')],
      })
    );

    const poller = await import('../src/main/services/github-poller');
    const prs = await poller.refreshPRs();

    expect(prs.map((pr) => pr.id)).toEqual([3, 2, 1]);
    expect(prs.find((pr) => pr.id === 2)?.mentionType).toBe('review_requested');
    expect(poller.getCachedPRs()).toEqual(prs);
  });

  it('maps statusCheckRollup states to ciStatus', async () => {
    execFileAsyncMock.mockResolvedValueOnce(
      gqlResponse({
        reviewRequested: [
          prNode(10, '2026-03-10T00:00:00.000Z', { rollupState: 'SUCCESS' }),
          prNode(11, '2026-03-11T00:00:00.000Z', { rollupState: 'FAILURE' }),
          prNode(12, '2026-03-12T00:00:00.000Z', { rollupState: 'PENDING' }),
          prNode(13, '2026-03-13T00:00:00.000Z', { rollupState: 'ERROR' }),
          prNode(14, '2026-03-14T00:00:00.000Z', { rollupState: null }),
        ],
      })
    );

    const poller = await import('../src/main/services/github-poller');
    const prs = await poller.refreshPRs();
    const byId = Object.fromEntries(prs.map((pr) => [pr.id, pr.ciStatus]));

    expect(byId[10]).toBe('success');
    expect(byId[11]).toBe('failure');
    expect(byId[12]).toBe('pending');
    expect(byId[13]).toBe('failure');
    expect(byId[14]).toBe('unknown');
  });

  it('notifies only for newly seen PR ids', async () => {
    execFileAsyncMock
      .mockResolvedValueOnce(
        gqlResponse({ reviewRequested: [prNode(1, '2026-03-01T00:00:00.000Z')] })
      )
      .mockResolvedValueOnce(
        gqlResponse({
          reviewRequested: [
            prNode(1, '2026-03-01T00:00:00.000Z'),
            prNode(2, '2026-03-02T00:00:00.000Z'),
          ],
        })
      );

    const poller = await import('../src/main/services/github-poller');
    await poller.refreshPRs();
    await poller.refreshPRs();

    expect(showPRNotificationMock).toHaveBeenCalledTimes(1);
    expect(showPRNotificationMock.mock.calls[0][0].id).toBe(2);
  });

  it('returns cached PRs when fetch fails', async () => {
    execFileAsyncMock
      .mockResolvedValueOnce(
        gqlResponse({ reviewRequested: [prNode(7, '2026-03-07T00:00:00.000Z')] })
      )
      .mockRejectedValueOnce(new Error('gh down'));

    const poller = await import('../src/main/services/github-poller');
    const initial = await poller.refreshPRs();
    const fallback = await poller.refreshPRs();

    expect(initial.map((pr) => pr.id)).toEqual([7]);
    expect(fallback.map((pr) => pr.id)).toEqual([7]);
  });

  it('clamps poll interval boundaries', async () => {
    execFileAsyncMock.mockResolvedValue(gqlResponse({}));

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
