## Why

Many users live inside Raycast all day and would rather invoke "open repo X in Cursor" or "commit changes in worktree Y" from their universal command bar than open a separate Electron menubar app. Raycast's extension surface — a search-driven list with per-item action panels (⌘K) — maps naturally onto the gh-viewer Git Manager's repo workspace. A first-class Raycast extension lets the existing macOS app stay focused on the menubar PR popover and the tiny-app workspace, while Raycast handles the Spotlight-style entry path the design's "Repo picker" iterations all gravitated toward.

This is the lowest-priority change of the three: it depends on the Git capabilities (worktree management, editor launchers) that ship in `redesign-git-workspace-tiny-app`, and it lives in a separate Raycast extension package rather than the Electron app's source tree.

## What Changes

- Add a new top-level package `raycast-extension/` (or sibling repo, decided in `design.md`) containing a Raycast extension with the following commands:
  - **Open Repository** — search-driven recents list + open-in-editor actions per result.
  - **Repo Workspace** — a repo-scoped view (mirrors the Electron tiny-app sections): branches and worktrees with per-row actions (Commit / Push / Pull / Merge main → branch / Open in Cursor / Claude Code / Codex / Zed / Terminal / Finder / Remove worktree).
- Each command's action panel (⌘K) SHALL group actions into "Open in" and "Git" sections matching the design.
- Recents and per-repo state SHALL be persisted via Raycast's `LocalStorage` API; no IPC into the Electron app is required.
- Git operations SHALL be implemented by shelling out to `git` from the extension (Raycast extensions are Node.js with full child_process access). Editor launchers SHALL use a per-target mechanism (PATH-based GUI shims for Cursor/Zed, `codex app <path>` for Codex Desktop, the `claude://code/new?folder=…` URL scheme for Claude Code, `open` for Terminal/Finder), with a clear failure toast when the target cannot be launched. See `design.md` for the full launch rules.
- The extension SHALL NOT depend on the Electron app being installed or running.

## Capabilities

### New Capabilities
- `raycast-repo-launcher`: A Raycast command that searches recent repositories and exposes per-result actions to open them in an editor or jump into the per-repo workspace.
- `raycast-repo-workspace`: A Raycast command that, given a selected repository, lists branches and worktrees with per-row Git and editor actions matching the Electron tiny-app's row affordances.

### Modified Capabilities
<!-- none -->

## Impact

- New top-level directory: `raycast-extension/` with its own `package.json`, `tsconfig.json`, and Raycast extension manifest. Independent of the Electron app's build.
- No changes to the Electron app's IPC or services.
- Depends on the editor-launcher binary resolution rules ratified in `redesign-git-workspace-tiny-app` (so they stay consistent across the two surfaces), but does not import that code.
- Out of scope: publishing to the Raycast Store. v1 is a local extension developers can `npm run dev` against.
