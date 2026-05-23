# gh-viewer Git Manager — Raycast Extension

Search recent repositories and manage worktrees, branches, and editor launchers
from Raycast. Mirrors the `gh-viewer` Electron tiny-app's repo workspace inside
Raycast's command bar.

## Requirements

- macOS (Raycast is macOS-only)
- [Raycast](https://www.raycast.com/) installed
- `git` on PATH
- Optional editor CLIs / apps (each "Open in X" action degrades gracefully with a toast if the target isn't available):
  - **Cursor** — install Cursor and run *Shell Command: Install `cursor`* from its command palette
  - **Zed** — install Zed and run *Install CLI* from its command palette
  - **Codex** — `codex` CLI on PATH (the `codex app <path>` subcommand opens Codex Desktop)
  - **Claude Code** — Claude Desktop app installed (the launcher uses the `claude://code/new?folder=…` URL scheme to land in the Claude Code tab)

## Install (local dev)

From the **repo root** (Electron + Raycast together):

```bash
pnpm setup   # once
pnpm start
```

Or this extension only:

```bash
pnpm dev:extension
```

While dev is running, the command appears in Raycast. Ctrl+C stops it.

## Commands

### Open Repository

A search-driven list focused on getting into a repo workspace quickly.

- **Recent** section — each repo row shows the current branch, branch count, and dirty state.
- **Add Repository…** — list action (**⌘N** or **⌘K** when no row is focused; also under **⌘K** on any recent row). Opens a folder picker and adds a git repo to recents.
  - **Enter (⏎)** — *Open Workspace* (worktrees, branches, editors)
  - **⌃X** — *Remove from Recents*

Editor launchers are **not** on this screen; use the workspace view after opening a repo.

Recents are persisted via Raycast's `LocalStorage` (max 20 entries, most-recent
first).

### Repo Workspace

Pushed from *Open Repository* when you pick a repo. Three sections:

- **Repository** — the primary checkout (repo root on the current branch). Tagged `local`. Actions: Open in (Claude default ⏎, Cursor ⌘↵, Codex, Zed, Terminal ⌘T, Finder ⌘F), **Create Worktree…** (⌘N, when on a named branch), Commit (⌘C), Push (⌘U), Pull, Merge main → branch.
- **Worktrees** — linked worktrees only (not the primary checkout). Same editor/git actions plus **Remove Worktree** (⌘⌫).
- **Local** — local branches without a worktree. Actions: Create worktree… (⏎ or ⌘N), Checkout in primary worktree, Delete / Force delete (`⌘⌫` / `⌘⇧⌫`), Open in &lt;editor&gt; (primary path).

## Implementation notes

- **Git invocation**: shell-out to `git` via `execa`, scoped per-call to
  the repo or worktree path. No JS git implementation.
- **Editor launchers**: per-target dispatch — see
  [`src/lib/editor.ts`](src/lib/editor.ts). Cursor/Zed via PATH binary +
  detached spawn; Codex via `codex app <path>`; Claude Code via the
  `claude://code/new?folder=…` URL scheme; Terminal/Finder via `open`.
- **Claude Code URL contract**: `claude://code/new?folder=<urlencoded-path>`
  is an internal route discovered in Claude.app v1.6608.2's bundle (the
  handler's `case QD.Code` branch). It's stable in the current release line
  but is not a public API — see
  `openspec/changes/add-raycast-extension/design.md` for the full note.

## Known limitations (v1)

- Recents are shared with the Electron Git Manager via `~/Library/Application Support/gh-viewer/recents.json` (max 20). Opening a repo in either surface updates the same list.
- Run **both** from the repo root: `pnpm start`. Or `pnpm dev:app` / `pnpm dev:extension` separately.
- **Open in gh-viewer** (⌘G) opens the Electron Git Manager via `gh-viewer://` (run `pnpm start` or `pnpm dev:app` first).
