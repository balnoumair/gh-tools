import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PullRequest, AuthStatus } from '@shared/types';
import { usePRStore } from '../src/renderer/stores/pr-store';

const makePR = (id: number): PullRequest => ({
  id,
  number: id,
  title: `PR ${id}`,
  url: `https://github.com/org/repo/pull/${id}`,
  repoFullName: 'org/repo',
  author: { login: 'octocat', avatarUrl: '' },
  ciStatus: 'unknown',
  updatedAt: new Date().toISOString(),
  mentionType: 'mentioned',
});

describe('usePRStore', () => {
  beforeEach(() => {
    usePRStore.setState({
      prs: [],
      authStatus: null,
      lastRefreshed: null,
      isRefreshing: false,
      error: null,
    });

    const baseAuth: AuthStatus = {
      authenticated: true,
      username: 'octocat',
      source: 'gh-cli',
    };

    window.electronAPI = {
      getPRs: vi.fn().mockResolvedValue([]),
      forceRefresh: vi.fn().mockResolvedValue([]),
      getAuthStatus: vi.fn().mockResolvedValue(baseAuth),
    } as any;
  });

  it('stores PRs and sets refresh metadata on fetch success', async () => {
    const prs = [makePR(1), makePR(2)];
    vi.mocked(window.electronAPI.getPRs).mockResolvedValueOnce(prs);

    await usePRStore.getState().fetchPRs();
    const state = usePRStore.getState();

    expect(window.electronAPI.getPRs).toHaveBeenCalledOnce();
    expect(state.prs).toEqual(prs);
    expect(state.error).toBeNull();
    expect(state.isRefreshing).toBe(false);
    expect(state.lastRefreshed).toBeInstanceOf(Date);
  });

  it('sets an error when fetchPRs fails', async () => {
    vi.mocked(window.electronAPI.getPRs).mockRejectedValueOnce(new Error('network'));

    await usePRStore.getState().fetchPRs();
    const state = usePRStore.getState();

    expect(state.error).toBe('Failed to fetch PRs');
    expect(state.isRefreshing).toBe(false);
  });

  it('falls back to unauthenticated status when checkAuth fails', async () => {
    vi.mocked(window.electronAPI.getAuthStatus).mockRejectedValueOnce(new Error('no auth'));

    await usePRStore.getState().checkAuth();

    expect(usePRStore.getState().authStatus).toEqual({
      authenticated: false,
      username: null,
      source: null,
    });
  });

  it('updates PRs on forceRefresh success', async () => {
    const prs = [makePR(3)];
    vi.mocked(window.electronAPI.forceRefresh).mockResolvedValueOnce(prs);

    await usePRStore.getState().forceRefresh();
    const state = usePRStore.getState();

    expect(window.electronAPI.forceRefresh).toHaveBeenCalledOnce();
    expect(state.prs).toEqual(prs);
    expect(state.error).toBeNull();
    expect(state.isRefreshing).toBe(false);
    expect(state.lastRefreshed).toBeInstanceOf(Date);
  });

  it('sets an error when forceRefresh fails', async () => {
    vi.mocked(window.electronAPI.forceRefresh).mockRejectedValueOnce(new Error('refresh failed'));

    await usePRStore.getState().forceRefresh();

    expect(usePRStore.getState().error).toBe('Failed to refresh');
    expect(usePRStore.getState().isRefreshing).toBe(false);
  });
});
