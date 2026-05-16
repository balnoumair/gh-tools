import { Icon } from "@raycast/api";
import type { Image } from "@raycast/api";
import type { EditorTarget } from "./types";

/**
 * Action icons for editor launchers. SVGs from https://svgl.app (see assets/editors/).
 */
export function editorActionIcon(target: EditorTarget): Icon | Image.ImageLike {
  switch (target) {
    case "cursor":
      return {
        source: {
          light: "editors/cursor_light.svg",
          dark: "editors/cursor_dark.svg",
        },
      };
    case "claude":
      return { source: "editors/claude.svg" };
    case "codex":
      return {
        source: {
          light: "editors/codex_light.svg",
          dark: "editors/codex_dark.svg",
        },
      };
    case "zed":
      return {
        source: {
          light: "editors/zed_light.svg",
          dark: "editors/zed_dark.svg",
        },
      };
    case "terminal":
      return Icon.Terminal;
    case "finder":
      return Icon.Finder;
  }
}
