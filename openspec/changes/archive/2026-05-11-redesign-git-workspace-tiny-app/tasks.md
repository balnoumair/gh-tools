# Tasks

## 1. Shared types and IPC

- [x] 1.1 In `src/shared/types.ts`, add `GitWorktree` (`{ path, branch, primary, dirty, ahead, behind }`), extend `GitRepoStatus` with `worktrees: GitWorktree[]`. Add `EditorTarget` = `'cursor' | 'claude' | 'codex' | 'zed' | 'terminal' | 'finder'` and `EditorLaunchResult` (`{ success: boolean, message: string }`). Add `WorktreeCreateOptions` and `WorktreeRemoveOptions`.
- [x] 1.2 In `src/shared/ipc-channels.ts`, add `GIT_LIST_WORKTREES`, `GIT_CREATE_WORKTREE`, `GIT_REMOVE_WORKTREE`, `EDITOR_OPEN`, `APP_SET_WINDOW_SIZE`.
- [x] 1.3 In `src/preload.ts`, expose `gitListWorktrees`, `gitCreateWorktree`, `gitRemoveWorktree`, `openInEditor(target, path)`, `setWindowSize(w, h)`.

## 2. Git service: worktrees

- [x] 2.1 In `src/main/services/git-service.ts`, add `listWorktrees(repoPath)` parsing `git worktree list --porcelain`. For each worktree, run `git -C <wt-path> status --porcelain` to derive `dirty`, and `git -C <wt-path> rev-list --left-right --count <branch>...<upstream>` for ahead/behind. Mark the entry whose path equals `repoPath` (or contains `.git/`) as `primary`.
- [x] 2.2 Add `createWorktree(repoPath, branch, targetPath)` running `git -C <repoPath> worktree add <targetPath> <branch>`. Validate target path doesn't exist before exec. Return `GitOperationResult`.
- [x] 2.3 Add `removeWorktree(repoPath, worktreePath, force?)` running `git -C <repoPath> worktree remove [--force] <worktreePath>`. Refuse if worktreePath equals the primary path. Return `GitOperationResult`.
- [x] 2.4 Extend `getRepoStatus(repoPath)` to include the worktrees list in its return payload.
- [x] 2.5 Wire IPC handlers in `src/main.ts` for the three new channels.

## 3. Editor launcher service

- [x] 3.1 Create `src/main/services/editor-launcher.ts` with `openInEditor(target: EditorTarget, path: string): Promise<EditorLaunchResult>`. Use `child_process.spawn(cmd, [path], { detached: true, stdio: 'ignore' })` and `.unref()`.
- [x] 3.2 Resolve binaries: `cursor` → `cursor`, `claude` → `claude`, `codex` → `codex`, `zed` → `zed`. For `terminal` use `open -a Terminal <path>` on macOS. For `finder` use `open <path>` on macOS. Use `which` (or `command -v`) to verify the binary is on PATH; on missing return `{ success: false, message: '<editor> CLI not found on PATH' }`.
- [x] 3.3 At main-process startup, load shell PATH via `process.env.PATH` plus a best-effort fallback (read `~/.zshrc` env or use `shell-env` package) so PATH-based resolution works when Electron is launched from Finder.
- [x] 3.4 Wire `EDITOR_OPEN` IPC handler in `src/main.ts`.

## 4. Window sizing

- [x] 4.1 In `src/main/windows.ts`, set the Git Manager window initial size to 920×580 (launcher mode) with `minWidth: 380`, `minHeight: 480`, `resizable: true`.
- [x] 4.2 Add an `APP_SET_WINDOW_SIZE` IPC handler that calls `mainWindow.setContentSize(w, h)` and `setResizable(w === 380 ? false : true)`. Width-locking is best-effort: when w === 380, also call `setMinimumSize(380, 480)` and `setMaximumSize(380, 9999)`.
- [x] 4.3 Renderer calls `setWindowSize(380, 680)` after `openRepo` / `selectRepo` succeeds, and `setWindowSize(920, 580)` whenever it returns to launcher mode (e.g. user closes the active repo).

## 5. Renderer store

- [x] 5.1 In `src/renderer/stores/git-store.ts`, remove the `outputLog` array and `appendOutput` / `clearOutput` actions. Keep `lastResult` for inline UI.
- [x] 5.2 Add worktree-related actions: `createWorktree(branch, targetPath)`, `removeWorktree(worktreePath, force?)`, `commitInWorktree(worktreePath, message, alsoPush?)`. The commit action runs `git add -A` + `git commit -m` against the worktree's path; on `alsoPush`, follow with `git push`.
- [x] 5.3 Add `openInEditor(target, path)` that calls the preload API and surfaces failures via a transient toast (new state slice `transientToast: { message, kind } | null`, auto-clears after 3s).

## 6. Tiny-app components

- [x] 6.1 Replace `src/renderer/views/FullApp.tsx` with the new layout: `<TitleBar />`, `<Toolbar />` (Commit/Push/Sync/Fetch), `<CurrentBranchStrip />`, `<ScrollStack>` containing `<WorktreeSection />`, `<BranchSection kind="local" />`, `<BranchSection kind="remote" />`, `<StashSection />`, then `<Footer />`.
- [x] 6.2 Create `src/renderer/components/git/Toolbar.tsx`: white-pill Commit (with monospace badge for staged count), Push, Sync, Fetch. Each button disables while `operationStatus === 'running'`.
- [x] 6.3 Create `src/renderer/components/git/CurrentBranchStrip.tsx`: branch glyph + monospace branch name + `↑N ↓M` + dirty dot.
- [x] 6.4 Create `src/renderer/components/git/WorktreeSection.tsx` and `WorktreeRow.tsx`. Row layout matches the design's `TinyWorktreeRow`: folder name + primary badge / branch line / editor strip (Cursor/Claude/Codex/Zed/Terminal) + status hint + ⋯ overflow + optional commit composer.
- [x] 6.5 Create `src/renderer/components/git/EditorStrip.tsx` rendering the four editor buttons + Terminal icon. Buttons use the design's monogram glyph (per `EditorGlyph` in icons.jsx).
- [x] 6.6 Create `src/renderer/components/git/CommitComposer.tsx`: textarea + `4 staged · ↑6` hint + Commit (primary, white) + `& Push` combo + Cancel. Bind to `commitInWorktree`.
- [x] 6.7 Create `src/renderer/components/git/SectionHeader.tsx`: caret + uppercase title + monospace count, click to toggle. Persist open/closed state via `localStorage` key `ghv:tiny-app:sections`.
- [x] 6.8 Create `src/renderer/components/git/BranchSection.tsx` rendering the design's compact `TinyBranchRow` (current dot + branch name + optional PR # + ahead/behind). Use existing branch data from `repoStatus.branches`.
- [x] 6.9 Create `src/renderer/components/git/StashSection.tsx` rendering existing stash entries with apply / pop / drop actions on a hover-only menu.
- [x] 6.10 Create `src/renderer/components/git/Footer.tsx`: monospace path · "N changed" indicator computed from `repoStatus`.
- [x] 6.11 Create `src/renderer/components/git/TitleBar.tsx` rewriting the existing `GitTitleBar.tsx` to match the design (traffic lights left, breadcrumb center).

## 7. Raycast-style launcher (no active repo)

- [x] 7.1 Replace `src/renderer/components/git/RepoPickerEmpty.tsx` with `RaycastLauncher.tsx`: centered 540-wide command bar over a wider 920×580 window. Search input + recents list rendering each repo with name, path (mono), branch + dirty dot, branches count.
- [x] 7.2 Wire selection to `useGitStore.openRepo` / `selectRepo` and trigger `setWindowSize(380, 680)` after a repo becomes active.
- [x] 7.3 Footer shows keyboard hints `↵ open · ⌘N clone · ⌘⇧O browse…`.

## 8. Delete obsolete components

- [x] 8.1 Delete `src/renderer/components/git/OutputPanel.tsx`.
- [x] 8.2 Delete `src/renderer/components/git/StashPanel.tsx` (replaced by `StashSection.tsx`).
- [x] 8.3 Delete `src/renderer/components/git/BranchPanel.tsx` and `BranchGroup.tsx` (replaced by `BranchSection.tsx`).
- [x] 8.4 Delete `src/renderer/components/git/GitToolbar.tsx` (replaced by `Toolbar.tsx`).
- [x] 8.5 Delete `src/renderer/components/git/GitTitleBar.tsx` (replaced by `TitleBar.tsx`).
- [x] 8.6 Delete `src/renderer/components/git/StatusBar.tsx` (folded into `Footer.tsx`).
- [x] 8.7 Keep `MergeDialog.tsx`, `PushDialog.tsx`, `UpdateDialog.tsx`, `StashCreateDialog.tsx`, `CreateBranchDialog.tsx`, `Dialog.tsx`, `BranchItem.tsx` for now; review whether they're still mounted by the new layout and remove what's truly orphaned.

## 9. Tests

- [x] 9.1 Add `test/main/git-service.worktree.test.ts` covering `listWorktrees`, `createWorktree`, `removeWorktree` with a temp git fixture.
- [x] 9.2 Add `test/main/editor-launcher.test.ts` covering successful launch (mocked spawn), missing-binary error, and missing-path error.
- [x] 9.3 Add `test/renderer/WorktreeRow.test.tsx` covering: dirty row exposes Commit in overflow, primary row hides Remove, behind row exposes Sync, editor strip renders five buttons (4 editors + Terminal).
- [x] 9.4 Add `test/renderer/RaycastLauncher.test.tsx` for filter behavior on the recents list.
- [x] 9.5 Update / delete tests for removed components (`OutputPanel`, `BranchPanel`, etc.).

## 10. Verification

- [x] 10.1 `pnpm build` succeeds.
- [x] 10.2 `pnpm test` passes.
- [ ] 10.3 `pnpm start` and visually verify against the design's `ws-tiny` artboard (380×680) and `pick-c` launcher artboard.
- [ ] 10.4 Smoke test on a real repo with at least 2 worktrees: list / create / remove / commit-in-worktree / open-in-Cursor.
