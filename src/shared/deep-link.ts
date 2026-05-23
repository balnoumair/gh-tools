import path from 'node:path';
import type { GitRepo } from './types';

/** Custom URL scheme used by Raycast (and other launchers) to open a repo in gh-viewer. */
export const GH_VIEWER_PROTOCOL = 'gh-viewer';

/** `gh-viewer://repo?path=…&name=…` */
export function buildRepoDeepLink(repo: GitRepo): string {
  const url = new URL(`${GH_VIEWER_PROTOCOL}://repo`);
  url.searchParams.set('path', repo.path);
  url.searchParams.set('name', repo.name);
  return url.toString();
}

export function parseRepoDeepLink(rawUrl: string): GitRepo | null {
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol !== `${GH_VIEWER_PROTOCOL}:`) return null;
    if (url.hostname !== 'repo') return null;

    const repoPath = url.searchParams.get('path');
    if (!repoPath) return null;

    const nameParam = url.searchParams.get('name');
    const name = nameParam?.trim() || path.basename(repoPath) || 'repository';

    return { path: repoPath, name };
  } catch {
    return null;
  }
}

export function extractDeepLinksFromArgv(argv: string[]): string[] {
  return argv.filter((arg) => arg.startsWith(`${GH_VIEWER_PROTOCOL}://`));
}

export function repoFromRendererSearchParams(
  search: string,
): GitRepo | null {
  const params = new URLSearchParams(search);
  const repoPath = params.get('repoPath');
  if (!repoPath) return null;

  const name =
    params.get('repoName')?.trim() ||
    path.basename(repoPath) ||
    'repository';

  return { path: repoPath, name };
}
