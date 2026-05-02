## Why

The current Git Manager is a multi-pane window with a heavy toolbar (Fetch / Update / Push / Merge / Branch / Shelve), a branch sidebar, a stash panel, and an Output panel that is mostly empty. The right side carries a lot of dead real estate. The design replaces it with a 380×680 single-pane "tiny app": header → primary-action toolbar (Commit, Push, Sync, Fetch) → current-branch summary → Worktrees (first-class, with inline "Open in editor" strip and per-row overflow menu) → Local branches → Remote branches → Stash → footer. Worktrees are first-class because a worktree-driven flow is the user's actual mental model. "Open in Cursor / Claude Code / Codex / Zed / Terminal / Finder" are first-class because that is how users transition from picker → editor in one click.

## What Changes

- **BREAKING** UI: the Git Manager window collapses from a multi-pane layout to a single 380×680 vertical stack. Output panel and standalone Stash panel are removed/folded.
- **BREAKING** behavior: the empty-state repo picker is replaced by a Raycast-style command-bar launcher (search + recents list with branch + dirty marker + last-opened). Selecting a recent or opening a folder is unchanged.
- The toolbar becomes 4 actions: **Commit** (primary, white pill, badge with staged count), **Push** (secondary), **Sync** (merge upstream into current branch), **Fetch** (icon-only). All other actions live in per-row overflow menus.
- A new "Worktrees" section lists each worktree with: folder name, primary badge, branch, dirty/clean status, ahead/behind, an inline editor strip (Cursor / Claude / Codex / Zed) + Terminal icon, a quiet status hint ("4 uncommitted · ↓1"), and a single ⋯ overflow menu (Commit / Sync / Pull / Push / Reveal in Finder / Remove).
- Dirty worktrees expose a Commit action that opens an inline composer (textarea + "4 staged · ↑6" + Commit / & Push / Cancel).
- Behind worktrees expose a Sync action that merges upstream into that worktree's branch.
- Branch sections become collapsible: Local (default open), Remote (default closed). Stash (default closed) is a section in the same scroll, not a separate panel.
- Footer is a single thin status row: repo path · "N changed" indicator.
- **NEW capability**: worktree management. The main process SHALL be able to list worktrees, create a worktree on a branch in a chosen path, and remove a worktree. Worktree status (dirty, ahead/behind) SHALL be exposed alongside branch status.
- **NEW capability**: open-in-editor launchers. The main process SHALL launch Cursor, Claude Code, Codex, Zed, the system Terminal, or Finder against a given path, using shell-out with the editor's CLI binary if installed; missing editors SHALL surface a clear error in the row's status hint without crashing the renderer.

## Capabilities

### New Capabilities
- `worktree-management`: List, create, and remove Git worktrees and expose their status (dirty / ahead-behind) per repository.
- `editor-launchers`: Launch external editors (Cursor / Claude Code / Codex / Zed) and system tools (Terminal, Finder) against a worktree or repository path.

### Modified Capabilities
- `git-repository-management`: Repository status payload SHALL include worktrees. Repository UI SHALL be a single 380×680 pane (toolbar, current-branch strip, worktrees, branches, stash, footer). Output log requirement SHALL be removed; operation results SHALL surface inline (success/error toasts or per-row hints) rather than in a persistent panel. The toolbar SHALL expose Commit (primary), Push, Sync, Fetch only.
- `app-shell`: Full Git Manager window SHALL load at 380×680 and SHALL be non-resizable in width below this size; the launcher (repo picker) SHALL load in a wider 920×580 layout. Repository status focus refresh SHALL extend to worktree status as well.

## Impact

- Affected code:
  - `src/renderer/views/FullApp.tsx` (rewrite layout)
  - `src/renderer/components/git/GitToolbar.tsx`, `BranchPanel.tsx`, `StashPanel.tsx`, `OutputPanel.tsx`, `BranchGroup.tsx`, `RepoPickerEmpty.tsx` (rewrite or delete)
  - New components: `WorktreeSection.tsx`, `WorktreeRow.tsx`, `BranchSection.tsx`, `StashSection.tsx`, `CommitComposer.tsx`, `EditorStrip.tsx`, `RaycastLauncher.tsx` (or rename `RepoPickerEmpty.tsx`)
  - `src/main/services/git-service.ts` — add `listWorktrees`, `createWorktree`, `removeWorktree`, augment `getRepoStatus` payload.
  - New `src/main/services/editor-launcher.ts` and IPC handlers.
  - `src/shared/types.ts` — add `GitWorktree`, `EditorTarget` types.
  - `src/shared/ipc-channels.ts` — add `GIT_LIST_WORKTREES`, `GIT_CREATE_WORKTREE`, `GIT_REMOVE_WORKTREE`, `EDITOR_OPEN`.
  - `src/preload.ts` — expose new methods.
  - `src/renderer/stores/git-store.ts` — add worktree state + actions.
  - `src/main/windows.ts` — set Git Manager window size and constraints.
- Output log persistence is dropped. If users need history, that is a separate change.
- Tests in `test/` need updates for new components and the worktree IPC.
