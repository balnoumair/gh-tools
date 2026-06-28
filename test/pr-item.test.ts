import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PullRequest } from '@shared/types';
import PRItem from '../src/renderer/components/tray/PRItem';

const makePR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
  id: 1,
  number: 42,
  title: 'Improve tray redesign',
  url: 'https://github.com/org/repo/pull/42',
  repoFullName: 'org/repo',
  headRefName: 'feature-branch',
  author: { login: 'octocat', avatarUrl: 'https://example.com/avatar.png' },
  isDraft: false,
  reviewDecision: null,
  ciStatus: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: [{ name: 'bug', color: 'ff0000' }],
  additions: 1,
  deletions: 2,
  mentionType: 'review_requested',
  ...overrides,
});

describe('PRItem', () => {
  it('does not render relative age text or labels', () => {
    const html = renderToStaticMarkup(
      React.createElement(PRItem, { pr: makePR(), index: 0 })
    );

    expect(html).not.toContain('just now');
    expect(html).not.toContain('bug');
  });

  it('renders CI dot in fixed right-edge slot and relationship pill', () => {
    const html = renderToStaticMarkup(
      React.createElement(PRItem, {
        pr: makePR({ mentionType: 'authored', ciStatus: 'success' }),
        index: 0,
      })
    );

    expect(html).toContain('w-2 shrink-0 flex items-center justify-center');
    expect(html).toContain('align-middle relative top-[-0.5px]');
    expect(html).toContain('Your PRs');
  });
});
