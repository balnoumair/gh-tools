import { describe, expect, it } from 'vitest';
import type { PullRequest } from '@shared/types';
import { getVisibleTrayPRs } from '../src/renderer/components/tray/pr-visibility';

const makePR = (id: number, mentionType: PullRequest['mentionType']): PullRequest => ({
  id,
  number: id,
  title: `PR ${id}`,
  url: `https://github.com/org/repo/pull/${id}`,
  repoFullName: 'org/repo',
  author: { login: 'octocat', avatarUrl: 'https://example.com/avatar.png' },
  isDraft: false,
  reviewDecision: null,
  ciStatus: 'unknown',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: [],
  additions: 0,
  deletions: 0,
  mentionType,
});

describe('getVisibleTrayPRs', () => {
  it('filters out mentioned and assigned PRs', () => {
    const prs = [
      makePR(1, 'mentioned'),
      makePR(2, 'review_requested'),
      makePR(3, 'assigned'),
      makePR(4, 'authored'),
    ];

    const visible = getVisibleTrayPRs(prs);

    expect(visible.map((pr) => pr.id)).toEqual([2, 4]);
  });

  it('orders review requested before authored while preserving group order', () => {
    const prs = [
      makePR(10, 'authored'),
      makePR(11, 'review_requested'),
      makePR(12, 'authored'),
      makePR(13, 'review_requested'),
    ];

    const visible = getVisibleTrayPRs(prs);

    expect(visible.map((pr) => pr.id)).toEqual([11, 13, 10, 12]);
  });
});
