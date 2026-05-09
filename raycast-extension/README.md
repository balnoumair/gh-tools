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

```bash
cd raycast-extension
npm install        # or pnpm install
npm run dev        # opens the extension in Raycast dev mode
```

While `npm run dev` is running, the two commands appear in Raycast as if they
were installed. Stopping the dev server unloads them.

## Commands

### Open Repository

A search-driven list of recent repositories. Each row exposes:

- **Open in** group: Cursor (default ↵), Claude Code (⌘↵), Codex, Zed, Terminal (⌘T), Reveal in Finder (⌘F)
- **Workspace** group: *Open Workspace* (⌘⇧O) — pushes the per-repo view
- **Recents** group: *Open Folder…* and *Remove from Recents* (⌃X)

Recents are persisted via Raycast's `LocalStorage` (max 20 entries, most-recent
first). Opening a repo bumps it to the front.

### Repo Workspace

A per-repository view with two sections:

- **Worktrees** — each row shows the branch (with a `primary` tag for the main
  worktree), short path, ahead/behind, and a `dirty` / `clean` tag. Per-row
  actions: Open in (same set as the launcher), Commit Changes… (⌘C), Push (⌘U),
  Pull, Merge main → branch, Remove worktree (destructive, ⌘⌫, hidden on the primary).
- **Branches** — local branches without a worktree. Per-row actions: Create
  worktree…, Checkout in primary worktree, Open in <editor> (primary path).

When invoked standalone from Raycast (not pushed from the launcher), the
command defaults to the most-recently-opened repo or shows an empty state
pointing to *Open Repository*.

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

- Recents inside this extension and recents inside the gh-viewer Electron menubar app are independent — no sync.
- No publish to the Raycast Store yet; v1 is local-dev only.
