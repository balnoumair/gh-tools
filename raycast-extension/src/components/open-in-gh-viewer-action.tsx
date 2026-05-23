import { Action, Icon } from "@raycast/api";
import { openRepoInGhViewer } from "../lib/open-gh-viewer";
import type { Repo } from "../lib/types";

export function OpenInGhViewerAction({
  repo,
  shortcut,
}: {
  repo: Repo;
  shortcut?: { modifiers: ("cmd" | "shift" | "opt" | "ctrl")[]; key: string };
}) {
  return (
    <Action
      title="Open in gh-viewer"
      icon={Icon.AppWindow}
      // @ts-expect-error Raycast types accept the keyboard shortcut shape we're using.
      shortcut={shortcut}
      onAction={() => openRepoInGhViewer(repo)}
    />
  );
}
