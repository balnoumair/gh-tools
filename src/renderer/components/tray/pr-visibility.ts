import type { PullRequest } from '@shared/types';

export function isVisibleTrayPR(pr: PullRequest): boolean {
  return pr.mentionType === 'review_requested' || pr.mentionType === 'authored';
}

export function getVisibleTrayPRs(prs: PullRequest[]): PullRequest[] {
  return prs
    .map((pr, index) => ({ pr, index }))
    .filter(({ pr }) => isVisibleTrayPR(pr))
    .sort((a, b) => {
      const aPriority = a.pr.mentionType === 'review_requested' ? 0 : 1;
      const bPriority = b.pr.mentionType === 'review_requested' ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.index - b.index;
    })
    .map(({ pr }) => pr);
}
