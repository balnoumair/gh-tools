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
- **Editor launchers**: `which <bin>` + `spawn(bin, [path], { detached: true, stdio: 'ignore' }).unref()`. Same set as the Electron app (`cursor`, `claude`, `codex`, `zed`, plus `open` for Terminal/Finder on macOS).
- **Cross-extension state**: not using `Cache` because we want recents to persist across Raycast restarts.

## Risks / Trade-offs

- Code duplication with the Electron app's editor-launcher and worktree services. Mitigation: keep the surface area small; if it grows we extract a shared package.
- Raycast extensions on macOS only. That matches the Electron app's target platform.
- Users may expect the menubar app's recents and the Raycast extension's recents to stay in sync. They won't in v1; this is documented and revisitable.

## Migration Plan

Greenfield code in a new directory. No migration.

## Open Questions

- Should we embed the gh-viewer brand glyph in the Raycast command icons or use Raycast's default git icon? Going with Raycast's default for v1 to keep the icon set consistent with other git extensions.
