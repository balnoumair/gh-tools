import type { PullRequest, GitWorktree } from '@shared/types';
import type { RootItem } from '../components/review/FusionSidebar';

export function prMatchesWorktree(pr: PullRequest, worktree: GitWorktree): boolean {
  return !!pr.headRefName && worktree.branch === pr.headRefName;
}

export function findWorktreeForPR(
  pr: PullRequest,
  roots: RootItem[],
): { repoPath: string; worktreePath: string } | null {
  const repoName = pr.repoFullName.split('/').pop();
  for (const root of roots) {
    if (root.name !== repoName && pr.repoFullName !== root.name) continue;
    const worktree = root.worktrees.find((w) => prMatchesWorktree(pr, w));
    if (worktree) {
      return { repoPath: root.path, worktreePath: worktree.path };
    }
  }
  return null;
}

export function findPRForWorktree(
  worktree: GitWorktree,
  prs: PullRequest[],
  repoName: string,
): PullRequest | null {
  return prs.find((pr) => {
    const prRepo = pr.repoFullName.split('/').pop();
    return (prRepo === repoName || pr.repoFullName === repoName) && prMatchesWorktree(pr, worktree);
  }) ?? null;
}

export function prsWithoutLocalWorktree(prs: PullRequest[], worktrees: GitWorktree[]): PullRequest[] {
  return prs.filter((pr) => !worktrees.some((w) => prMatchesWorktree(pr, w)));
}
