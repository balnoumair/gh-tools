import { describe, expect, it } from 'vitest';
import {
  buildRepoDeepLink,
  extractDeepLinksFromArgv,
  parseRepoDeepLink,
  repoFromRendererSearchParams,
} from '../src/shared/deep-link';

describe('deep-link', () => {
  it('builds and parses a repo URL', () => {
    const repo = { path: '/Users/dev/my-repo', name: 'my-repo' };
    const url = buildRepoDeepLink(repo);
    expect(parseRepoDeepLink(url)).toEqual(repo);
  });

  it('derives name from path when omitted', () => {
    const url = 'gh-viewer://repo?path=%2Ftmp%2Ffoo-bar';
    expect(parseRepoDeepLink(url)).toEqual({
      path: '/tmp/foo-bar',
      name: 'foo-bar',
    });
  });

  it('rejects unknown hosts', () => {
    expect(parseRepoDeepLink('gh-viewer://other?path=/tmp/x')).toBeNull();
  });

  it('extracts deep links from argv', () => {
    const argv = ['electron', 'gh-viewer://repo?path=/a', '--foo'];
    expect(extractDeepLinksFromArgv(argv)).toEqual(['gh-viewer://repo?path=/a']);
  });

  it('reads repo from renderer search params', () => {
    expect(
      repoFromRendererSearchParams(
        '?mode=full&repoPath=%2Ftmp%2Fx&repoName=custom',
      ),
    ).toEqual({ path: '/tmp/x', name: 'custom' });
  });
});
