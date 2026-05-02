## Context

The current Git Manager is a wide multi-pane window: title bar → toolbar (Fetch / Update / Push / Merge / Branch / Shelve) → branch sidebar → Stash panel + Output panel. The Output panel is mostly empty space; the heavy toolbar competes with the branch list for visual weight; worktrees have no surface; and there's no way to bridge from "I have this branch checked out here" to "open it in Cursor" without leaving the app. The design replaces this with a single 380×680 vertical stack ("tiny app") that puts Worktrees first-class, collapses Local/Remote/Stash into the same scroll, drops the Output panel, and packs four high-frequency actions into the top toolbar.

The launcher (no active repo state) becomes a Raycast-style command-bar window: 920×580, centered search input, recents list with branch + dirty marker. This is a wider window than the tiny app on purpose — the launcher is a one-time gesture that benefits from breathing room, while the workspace is a permanent companion that should sit out of the way.

## Goals / Non-Goals

**Goals**
- Single 380×680 pane with a clear top-down information hierarchy.
- Worktrees as a first-class section with per-row editor launchers.
- "Open in Cursor / Claude / Codex / Zed / Terminal / Finder" as a one-click affordance per worktree.
- Inline commit composer per dirty worktree (no modal hop).
- Sync (merge upstream into current branch or a chosen worktree) as a top-level affordance.
- Replace the empty repo-picker hero with a Raycast-style command launcher.
- Drop the Output panel; surface results inline.

**Non-Goals**
- Building a separate Raycast extension. That is `add-raycast-extension`, a parallel change.
- Implementing all the speculative menu items the design shows (e.g. "Reveal in Finder" on every row beyond what fits cleanly). Start with what the design canonical row shows.
- Replacing the existing dialogs (MergeDialog, PushDialog, etc.) wholesale; they may still be reused for confirmation flows.

## Decisions

- **One window, two modes.** Same Electron `BrowserWindow`. In launcher mode the window is 920×580 with the command-bar centered. After a repo is opened, the renderer calls `setSize(380, 680)` via a new IPC `app:set-window-size` (or via existing window APIs). Avoids spawning a second window.
- **Worktree status comes from `git worktree list --porcelain` + a per-worktree `git status --porcelain` + a per-worktree rev-list ahead/behind.** This is N+1 commands per refresh — acceptable because most repos have ≤ 4 worktrees. We refresh on focus or after each operation, not on a timer.
- **Editor binaries are resolved by name on `PATH`.** `cursor`, `claude`, `codex`, `zed`. If the binary is missing, the launch surfaces a non-success result; the row's status hint shows "cursor not installed" briefly. We do NOT try to discover the .app bundle path on macOS — too fragile, and most users with these editors have run their CLI installer.
- **Inline commit composer commits in the worktree's working directory**, not the active repo's. We pass `cwd: worktree.path` to the underlying `git` exec.
- **Output log is dropped.** The store keeps `lastResult` and operation status for inline UI. Anything that needed a 200-line scrollback was rare; we don't replace it.
- **Footer N changed** comes from `repoStatus.untracked + staged + modified + conflict` — same source as the existing dirty indicator.
- **Section collapse state** lives in a small renderer-only persistence (`localStorage` key `ghv:tiny-app:sections`) so the user's preference survives across sessions.
- **Stash section** is in the same vertical scroll. We're not deleting stash capability, just demoting its UI.
- **Menubar / popover** is unchanged by this proposal — it still uses `mode=tray` and is a separate window.

## Risks / Trade-offs

- Locking the window width to 380 may surprise users who liked the wide multi-pane. Mitigation: this is an explicit redesign goal, the user signed off on "tiny app" framing in the chat. We can revisit if usability complaints come in.
- N+1 git invocations on refresh are slower than a single batch call. Acceptable for ≤ ~6 worktrees; if profiling shows otherwise, batch with `git -C` calls executed in parallel.
- Editor launcher PATH resolution is brittle on macOS GUI launches (Electron may not inherit the user's shell PATH). Mitigation: source `~/.zshrc` / `~/.bash_profile` PATH at startup via `shell-env` or similar (see implementation tasks).
- Removing the Output panel removes a surface power users may have used to debug failed operations. Mitigation: error messages are still surfaced inline; a follow-up change can reintroduce a hidden-by-default debug log if needed.

## Migration Plan

Single PR. Renderer-side feature flag is not needed — the redesign is a wholesale UI swap. The IPC additions (worktree, editor) are purely additive; existing IPC channels stay backward compatible during this change.

## Open Questions

- Should "New worktree" use a modal or a simple inline form? Going with a small modal reusing the existing Dialog primitive for now.
- Should the launcher list show all repos discoverable on disk, or only "recent"? Going with recents only for v1, mirroring the design.
