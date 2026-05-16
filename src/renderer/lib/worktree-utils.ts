import type { GitBranch, GitWorktree } from '@shared/types';

export function isDetachedWorktreeBranch(branch: string): boolean {
  return branch.startsWith('(detached)');
}

export function branchNamesWithWorktree(worktrees: GitWorktree[]): Set<string> {
  const names = new Set<string>();
  for (const worktree of worktrees) {
    if (!isDetachedWorktreeBranch(worktree.branch)) {
      names.add(worktree.branch);
    }
  }
  return names;
}

export function getPrimaryWorktree(worktrees: GitWorktree[]): GitWorktree | undefined {
  return worktrees.find((worktree) => worktree.primary);
}

export function getLinkedWorktrees(worktrees: GitWorktree[]): GitWorktree[] {
  return worktrees.filter((worktree) => !worktree.primary);
}

export function localBranchesWithoutWorktree(
  branches: GitBranch[],
  worktrees: GitWorktree[],
): GitBranch[] {
  const withWorktree = branchNamesWithWorktree(worktrees);
  return branches.filter((branch) => !branch.isRemote && !withWorktree.has(branch.name));
}
