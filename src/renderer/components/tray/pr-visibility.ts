import type { PullRequest } from '@shared/types';
import { isNotifierRepoFlagged, type NotifierSettings } from '@shared/settings';

export type TrayFilter = 'all' | 'review' | 'yours';

export function filterNotifierPRs(
  prs: PullRequest[],
  notifier: Pick<NotifierSettings, 'hiddenRepos'>,
): PullRequest[] {
  return prs.filter((pr) => !isNotifierRepoFlagged(notifier.hiddenRepos, pr.repoFullName));
}

export function filterPRs(prs: PullRequest[], filter: TrayFilter): PullRequest[] {
  if (filter === 'review') return prs.filter((p) => p.mentionType === 'review_requested');
  if (filter === 'yours') return prs.filter((p) => p.mentionType === 'authored');
  return prs;
}

export function getPRsByRepo(prs: PullRequest[]): { repo: string; prs: PullRequest[] }[] {
  const order: string[] = [];
  const map: Record<string, PullRequest[]> = {};
  for (const pr of prs) {
    const repo = pr.repoFullName.split('/')[1] ?? pr.repoFullName;
    if (!map[repo]) { map[repo] = []; order.push(repo); }
    map[repo].push(pr);
  }
  return order.map((repo) => ({ repo, prs: map[repo] }));
}
