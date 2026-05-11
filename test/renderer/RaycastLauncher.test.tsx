import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RaycastLauncher from '../../src/renderer/components/git/RaycastLauncher';
import { useGitStore } from '../../src/renderer/stores/git-store';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: React.ReactElement): Root {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return root;
}

describe('RaycastLauncher', () => {
  let root: Root | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    window.electronAPI = {
      setWindowSize: vi.fn().mockResolvedValue(undefined),
    } as any;
    useGitStore.setState({
      recentRepos: [
        { name: 'gh-tools', path: '/repos/gh-tools' },
        { name: 'notes-app', path: '/repos/notes-app' },
      ],
      openRepo: vi.fn(),
      selectRepo: vi.fn(),
    } as any);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
  });

  it('filters recents by query', () => {
    root = render(<RaycastLauncher />);

    expect(document.body.textContent).toContain('gh-tools');
    expect(document.body.textContent).toContain('notes-app');

    const input = document.querySelector('input')!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, 'notes');
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'notes' }));
    });

    expect(document.body.textContent).not.toContain('gh-tools');
    expect(document.body.textContent).toContain('notes-app');
  });
});
