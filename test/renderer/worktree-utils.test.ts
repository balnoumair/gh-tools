import { describe, expect, it } from 'vitest';
import {
  branchNamesWithWorktree,
  getLinkedWorktrees,
  getPrimaryWorktree,
  localBranchesWithoutWorktree,
} from '../../src/renderer/lib/worktree-utils';
import type { GitBranch, GitWorktree } from '@shared/types';

const worktrees: GitWorktree[] = [
  { path: '/repo', branch: 'main', primary: true, dirty: false, ahead: 0, behind: 0 },
  { path: '/repo-feature', branch: 'feature', primary: false, dirty: false, ahead: 0, behind: 0 },
];

const branches: GitBranch[] = [
  { name: 'main', current: true, tracking: null, isRemote: false, remoteName: null, commitHash: 'abc', ahead: 0, behind: 0 },
  { name: 'feature', current: false, tracking: null, isRemote: false, remoteName: null, commitHash: 'def', ahead: 0, behind: 0 },
  { name: 'orphan', current: false, tracking: null, isRemote: false, remoteName: null, commitHash: 'ghi', ahead: 0, behind: 0 },
];

describe('worktree-utils', () => {
  it('splits primary and linked worktrees', () => {
    expect(getPrimaryWorktree(worktrees)?.path).toBe('/repo');
    expect(getLinkedWorktrees(worktrees)).toHaveLength(1);
    expect(getLinkedWorktrees(worktrees)[0].branch).toBe('feature');
  });

  it('lists branch names checked out in worktrees', () => {
    expect(branchNamesWithWorktree(worktrees)).toEqual(new Set(['main', 'feature']));
  });

  it('filters local branches without a worktree', () => {
    const orphan = localBranchesWithoutWorktree(branches, worktrees);
    expect(orphan.map((b) => b.name)).toEqual(['orphan']);
  });
});
