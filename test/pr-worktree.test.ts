import { describe, expect, it } from 'vitest';
import type { PullRequest, GitWorktree } from '@shared/types';
import {
  findPRForWorktree,
  findWorktreeForPR,
  prMatchesWorktree,
  prsWithoutLocalWorktree,
} from '../src/renderer/lib/pr-worktree';
import type { RootItem } from '../src/renderer/components/review/FusionSidebar';

const makePR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  id: 1,
  number: 42,
  title: 'Test PR',
  url: 'https://github.com/org/gh-tools/pull/42',
  repoFullName: 'org/gh-tools',
  headRefName: 'my-feature',
  author: { login: 'dev', avatarUrl: '' },
  ciStatus: 'success',
  updatedAt: new Date().toISOString(),
  mentionType: 'review_requested',
  ...overrides,
});

const makeWorktree = (overrides: Partial<GitWorktree> = {}): GitWorktree => ({
  path: '/tmp/gh-tools-my-feature',
  branch: 'my-feature',
  primary: false,
  dirty: true,
  ahead: 2,
  behind: 0,
  ...overrides,
});

const makeRoot = (overrides: Partial<RootItem> = {}): RootItem => ({
  name: 'gh-tools',
  path: '/tmp/gh-tools',
  dirty: false,
  worktrees: [makeWorktree()],
  prs: [makePR()],
  ...overrides,
});

describe('pr-worktree helpers', () => {
  it('matches PR head branch to worktree branch', () => {
    expect(prMatchesWorktree(makePR(), makeWorktree())).toBe(true);
    expect(prMatchesWorktree(makePR({ headRefName: 'other' }), makeWorktree())).toBe(false);
  });

  it('finds a local worktree for a PR', () => {
    const roots = [makeRoot()];
    expect(findWorktreeForPR(makePR(), roots)).toEqual({
      repoPath: '/tmp/gh-tools',
      worktreePath: '/tmp/gh-tools-my-feature',
    });
  });

  it('finds a linked PR for a worktree', () => {
    const pr = makePR();
    expect(findPRForWorktree(makeWorktree(), [pr], 'gh-tools')).toEqual(pr);
  });

  it('hides PRs that already have a local worktree', () => {
    const pr = makePR();
    const other = makePR({ id: 2, number: 7, headRefName: 'other-branch' });
    const worktrees = [makeWorktree()];
    expect(prsWithoutLocalWorktree([pr, other], worktrees)).toEqual([other]);
  });
});
