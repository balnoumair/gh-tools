import { Toast, showToast, open } from "@raycast/api";
import { buildGhViewerRepoUrl } from "./gh-viewer-deep-link";

export async function openRepoInGhViewer(repo: {
  path: string;
  name: string;
}): Promise<void> {
  try {
    await open(buildGhViewerRepoUrl(repo));
  } catch (err) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Couldn't open gh-viewer",
      message:
        (err as Error).message ||
        "Install gh-viewer and run it once so macOS registers the gh-viewer:// URL.",
    });
  }
}
