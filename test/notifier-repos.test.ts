import { describe, expect, it } from 'vitest';
import { isNotifierRepoFlagged, uniqueNotifierRepos } from '@shared/settings';
import { filterNotifierPRs } from '../src/renderer/components/tray/pr-visibility';
import type { PullRequest } from '@shared/types';

function pr(id: number, repoFullName: string): PullRequest {
  return {
    id,
    number: id,
    title: `PR ${id}`,
    url: `https://github.com/${repoFullName}/pull/${id}`,
    repoFullName,
    author: { login: 'dev', avatarUrl: '' },
    mentionType: 'review_requested',
    ciStatus: 'success',
    updatedAt: new Date().toISOString(),
  };
}

describe('notifier repo visibility', () => {
  it('flags repos by full name or legacy short name', () => {
    expect(isNotifierRepoFlagged({ 'acme/widget': true }, 'acme/widget')).toBe(true);
    expect(isNotifierRepoFlagged({ widget: true }, 'acme/widget')).toBe(true);
    expect(isNotifierRepoFlagged({}, 'acme/widget')).toBe(false);
  });

  it('dedupes notifier repos from PRs', () => {
    const repos = uniqueNotifierRepos([
      pr(1, 'acme/a'),
      pr(2, 'acme/b'),
      pr(3, 'acme/a'),
    ]);
    expect(repos.map((r) => r.fullName)).toEqual(['acme/a', 'acme/b']);
  });

  it('filters hidden repos out of the menubar list', () => {
    const prs = [pr(1, 'acme/a'), pr(2, 'acme/b')];
    const visible = filterNotifierPRs(prs, { hiddenRepos: { 'acme/b': true } });
    expect(visible.map((p) => p.id)).toEqual([1]);
  });
});
