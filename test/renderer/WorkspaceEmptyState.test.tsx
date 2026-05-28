import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorkspaceEmptyState from '../../src/renderer/components/git/WorkspaceEmptyState';
import { useGitStore } from '../../src/renderer/stores/git-store';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactElement): Root {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return root;
}

describe('WorkspaceEmptyState', () => {
  let root: Root | null = null;
  const selectRepo = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    selectRepo.mockClear();
    useGitStore.setState({ recentRepos: [], selectRepo } as any);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
  });

  it('prompts to open a repository and triggers selectRepo', () => {
    root = render(<WorkspaceEmptyState />);

    expect(document.body.textContent).toContain('No project open');

    const button = document.querySelector('button')!;
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(selectRepo).toHaveBeenCalledOnce();
  });

  it('points to the selector when recents exist', () => {
    useGitStore.setState({
      recentRepos: [{ name: 'gh-tools', path: '/repos/gh-tools' }],
      selectRepo,
    } as any);

    root = render(<WorkspaceEmptyState />);

    expect(document.body.textContent).toContain('selector above');
  });
});
