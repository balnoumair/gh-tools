## Context

Raycast extensions are React-based, run inside the Raycast process, ship as Node.js with full child_process access, and expose a list/grid/form/detail UI primitive set plus an `ActionPanel` (⌘K) for per-row actions. The design's "Picker A · Raycast launcher" and "Picker B · Repo workspace in Raycast" artboards explicitly mirror Raycast's command-bar + action-panel pattern, so this is a natural port rather than an adaptation.

This change is intentionally scoped to a separate package so the Electron app and the Raycast extension can ship independently. The two surfaces will share a common mental model (recents, worktree-first, editor launchers) but no code at first.

## Goals / Non-Goals

**Goals**
- Two Raycast commands: `Open Repository` (launcher) and `Repo Workspace` (per-repo view).
- Per-row action panels matching the design's "Open in" + "Git" groupings.
- Standalone — doesn't require the Electron app installed.
- Reuse the same editor-launcher resolution rules as the Electron app (PATH-based, surface missing CLIs as toasts).

**Non-Goals**
- Publishing to the Raycast Store. v1 is a local-dev extension.
- Sharing TypeScript packages between the Electron app and the extension. If duplication grows, we extract a `@gh-viewer/git-core` workspace later.
- Notifications inside Raycast — Raycast handles toasts; the menubar app is still the place for desktop notifications about new PRs.

## Decisions

- **Location**: top-level `raycast-extension/` directory inside this repo (monorepo layout). Keeps the spec, design, and tasks colocated and lets us share fixtures if we want. The extension's `package.json` is independent; CI can build it separately.
- **Stack**: Raycast's official React + TypeScript template. No Vite — Raycast's CLI handles bundling.
- **Persistence**: Raycast `LocalStorage` for recents. No filesystem state files.
- **Git invocation**: shell-out via `execa` (or `node:child_process`'s `exec` with promisify). All commands receive `{ cwd: repoPath }` (or worktree path). Errors surface as `showToast({ style: Toast.Style.Failure })`.
- **Worktree listing**: same approach as the Electron app — `git worktree list --porcelain` then per-worktree `git status --porcelain` and `rev-list --left-right --count`. Acceptable since most repos have ≤ 4 worktrees.
- **Editor launchers**: per-target launch mechanism — there is no single rule. The `claude` and `codex` CLIs are interactive terminal REPLs, not GUI launcher shims, so the "PATH binary + detached spawn" pattern only fits some targets. Concretely:
  - **Cursor / Zed**: `which <bin>` + `spawn(bin, [path], { detached: true, stdio: 'ignore' }).unref()`. These ship GUI launcher shims on PATH that open the app at the given folder.
  - **Codex Desktop**: `spawn('codex', ['app', path], { detached: true, stdio: 'ignore' }).unref()`. The `codex app <PATH>` subcommand is officially documented as "Launch the Codex desktop app … workspace path to open".
  - **Claude Code (Claude Desktop)**: `spawn('open', ['claude://code/new?folder=' + encodeURIComponent(path)], { detached: true })`. Uses Claude.app's `claude://` URL scheme. The `code/new` route lands in the Claude Code tab (vs `cowork/new`, which lands in Cowork). Optional `q=<prompt>` and additional `folder=<path>` params are supported.
  - **Terminal**: `spawn('open', ['-a', 'Terminal', path])`. **Finder**: `spawn('open', [path])`.
  - **Failure surface**: each target has a different failure mode — missing PATH binary (Cursor/Zed/Codex), missing `Claude.app` registered for the `claude://` scheme, or `open` returning non-zero. All are surfaced as `showToast({ style: Toast.Style.Failure })` with a target-specific message.
- **Note on the `claude://code/new` route**: this is an internal URL contract discovered by reading Claude.app's bundle (v1.6608.2 — `claudeURLHandler` → `case QD.Code`), not a public API. It is stable in the current release line but Anthropic could rename `code` / `cowork` / `epitaxy` in a future version. The launcher code SHALL include a comment pointing to this design note so future maintainers know where the URL came from.
- **Cross-extension state**: not using `Cache` because we want recents to persist across Raycast restarts.

## Risks / Trade-offs

- Code duplication with the Electron app's editor-launcher and worktree services. Mitigation: keep the surface area small; if it grows we extract a shared package.
- Raycast extensions on macOS only. That matches the Electron app's target platform.
- Users may expect the menubar app's recents and the Raycast extension's recents to stay in sync. They won't in v1; this is documented and revisitable.

## Migration Plan

Greenfield code in a new directory. No migration.

## Open Questions

- Should we embed the gh-viewer brand glyph in the Raycast command icons or use Raycast's default git icon? Going with Raycast's default for v1 to keep the icon set consistent with other git extensions.
