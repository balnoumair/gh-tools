import { describe, expect, it } from 'vitest';
import type { AuthStatus, PullRequest } from '../src/shared/types';

describe('shared type fixtures', () => {
  it('builds a complete PullRequest-shaped object', () => {
    const pr: PullRequest = {
      id: 42,
      number: 7,
      title: 'Improve polling behavior',
      url: 'https://github.com/org/repo/pull/7',
      repoFullName: 'org/repo',
      author: {
        login: 'octocat',
        avatarUrl: 'https://example.com/avatar.png',
      },
      isDraft: false,
      reviewDecision: null,
      ciStatus: 'unknown',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      labels: [{ name: 'ready', color: '00ff00' }],
      additions: 10,
      deletions: 2,
      mentionType: 'review_requested',
    };

    expect(pr.id).toBeTypeOf('number');
    expect(pr.repoFullName).toContain('/');
    expect(pr.author.login.length).toBeGreaterThan(0);
    expect(Array.isArray(pr.labels)).toBe(true);
  });

  it('builds a complete AuthStatus-shaped object', () => {
    const auth: AuthStatus = {
      authenticated: true,
      username: 'octocat',
      source: 'gh-cli',
    };

    expect(auth.authenticated).toBe(true);
    expect(auth.username).toBe('octocat');
    expect(auth.source).toBe('gh-cli');
  });
});
