/** Must match `src/shared/deep-link.ts` in the Electron app. */
const GH_VIEWER_PROTOCOL = "gh-viewer";

export function buildGhViewerRepoUrl(repo: {
  path: string;
  name: string;
}): string {
  const url = new URL(`${GH_VIEWER_PROTOCOL}://repo`);
  url.searchParams.set("path", repo.path);
  url.searchParams.set("name", repo.name);
  return url.toString();
}
