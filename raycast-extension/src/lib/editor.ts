import { execa } from "execa";
import { spawn } from "node:child_process";
import type { EditorTarget } from "./types";

/**
 * Open a path in the chosen editor / app. Each target has its own launch
 * mechanism — see openspec/changes/add-raycast-extension/design.md for the
 * full rationale. Briefly:
 *
 *   - cursor / zed → PATH-based GUI launcher shim, detached spawn
 *   - codex        → `codex app <path>` (officially documented)
 *   - claude       → `open "claude://code/new?folder=<urlencoded>"` (URL scheme;
 *                    the `code/new` route is an internal contract discovered
 *                    in Claude.app v1.6608.2 — see design.md)
 *   - terminal     → `open -a Terminal <path>`
 *   - finder       → `open <path>`
 *
 * Throws an Error with a user-friendly message on launch failure. Callers should
 * surface the message via `showToast({ style: Toast.Style.Failure, message })`.
 */
export async function openInEditor(
  target: EditorTarget,
  path: string,
): Promise<void> {
  switch (target) {
    case "cursor":
      await spawnPathBinary("cursor", [path], "Cursor");
      return;
    case "zed":
      await spawnPathBinary("zed", [path], "Zed");
      return;
    case "codex":
      // `codex` is a PATH-based binary that *does* dispatch to GUI when given
      // the `app` subcommand. The CLI handles the launch; we just fire and forget.
      await spawnPathBinary("codex", ["app", path], "Codex");
      return;
    case "claude": {
      // Internal URL contract — see design.md ("Note on the `claude://code/new` route").
      // Launches Claude.app's Claude Code tab scoped to the given folder.
      const url = `claude://code/new?folder=${encodeURIComponent(path)}`;
      await spawnOpen([url], "Claude.app");
      return;
    }
    case "terminal":
      await spawnOpen(["-a", "Terminal", path], "Terminal.app");
      return;
    case "finder":
      await spawnOpen([path], "Finder");
      return;
  }
}

/**
 * Resolve a binary on PATH and spawn it detached, then unref so the Raycast
 * process doesn't hold the child open.
 */
async function spawnPathBinary(
  bin: string,
  args: string[],
  displayName: string,
): Promise<void> {
  // `which` to verify the binary is on PATH and produce a clean failure toast.
  try {
    await execa("which", [bin]);
  } catch {
    throw new Error(`${displayName} CLI (\`${bin}\`) not found on PATH.`);
  }
  try {
    const child = spawn(bin, args, { detached: true, stdio: "ignore" });
    child.unref();
  } catch (err) {
    throw new Error(
      `Failed to launch ${displayName}: ${(err as Error).message}`,
    );
  }
}

/**
 * Spawn macOS `open` with the given args. `open` exits non-zero when the URL
 * scheme has no registered handler (e.g. Claude.app not installed) or when
 * the target app cannot be located — surface that as a clean error.
 */
async function spawnOpen(args: string[], displayName: string): Promise<void> {
  try {
    // Use execa here (not detached spawn) so a non-zero exit is captured —
    // `open` itself returns immediately once the target app has been told to
    // launch, so this does not block the Raycast UI in practice.
    await execa("open", args);
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? "";
    if (
      stderr.includes("does not exist") ||
      stderr.includes("Unable to find application")
    ) {
      throw new Error(
        `${displayName} is not installed or not registered with macOS.`,
      );
    }
    throw new Error(
      `Failed to open ${displayName}: ${stderr || (err as Error).message}`,
    );
  }
}
