import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorktreeRow from '../../src/renderer/components/git/WorktreeRow';
import { useGitStore } from '../../src/renderer/stores/git-store';
import type { GitWorktree } from '@shared/types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactElement): Root {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return root;
}

const dirtyBehindWorktree: GitWorktree = {
  path: '/repo/feature-worktree',
  branch: 'feature',
  primary: false,
  dirty: true,
  ahead: 2,
  behind: 1,
};

describe('WorktreeRow', () => {
  let root: Root | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    useGitStore.setState({
      openInEditor: vi.fn(),
      commitInWorktree: vi.fn(),
      removeWorktree: vi.fn(),
      syncWorktree: vi.fn(),
      push: vi.fn(),
    } as any);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
  });

  it('renders five editor buttons', () => {
    root = render(<WorktreeRow worktree={dirtyBehindWorktree} stagedCount={4} />);

    expect(document.querySelectorAll('button[aria-label^="Open in"]')).toHaveLength(5);
  });

  it('dirty and behind rows expose commit and sync actions in overflow', () => {
    root = render(<WorktreeRow worktree={dirtyBehindWorktree} stagedCount={4} />);

    act(() => {
      document.querySelector('button[aria-label="Worktree actions"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(document.body.textContent).toContain('Commit changes');
    expect(document.body.textContent).toContain('Sync feature');
    expect(document.body.textContent).toContain('Remove worktree');
  });

  it('primary rows hide remove', () => {
    useGitStore.setState({ createWorktree: vi.fn() } as any);
    root = render(
      <WorktreeRow
        worktree={{ ...dirtyBehindWorktree, primary: true, path: '/repo' }}
        stagedCount={4}
      />,
    );

    act(() => {
      document.querySelector('button[aria-label="Worktree actions"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(document.body.textContent).not.toContain('Remove worktree');
  });
});
