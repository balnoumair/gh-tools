# Tasks

## 1. Bootstrap the extension package

- [ ] 1.1 Create `raycast-extension/` at the repo root. Inside it run `npx create-raycast-extension` (or set up the boilerplate manually) targeting TypeScript.
- [ ] 1.2 Configure `package.json` with two `commands`: `open-repository` (mode: `view`, name: "Open Repository") and `repo-workspace` (mode: `view`, name: "Repo Workspace", but invoked via `push` from the launcher).
- [ ] 1.3 Add dev dependencies: `execa`, `@types/node`. Use Raycast-provided React types from `@raycast/api`.

## 2. Shared utilities

- [ ] 2.1 `raycast-extension/src/lib/git.ts`: `listWorktrees(repoPath)`, `listBranches(repoPath)`, `getRepoStatus(repoPath)`, `commitInWorktree(path, message)`, `removeWorktree(repoPath, wtPath, force?)`, `createWorktree(repoPath, branch, target)`, `merge(repoPath, branch)`.
- [ ] 2.2 `raycast-extension/src/lib/editor.ts`: `openInEditor(target, path)` resolving via `which` and spawning detached. Same target set as the Electron app.
- [ ] 2.3 `raycast-extension/src/lib/recents.ts`: `loadRecents()`, `addRecent(repo)`, `removeRecent(path)` backed by `LocalStorage` (key `recents`, max 20 entries).

## 3. Open Repository command

- [ ] 3.1 `raycast-extension/src/open-repository.tsx`: `<List>` with `searchBarPlaceholder="Search recent repos…"`. Each `<List.Item>` shows repo name, accessory with branch + dirty dot.
- [ ] 3.2 `<ActionPanel>` per item with sections "Open in" (Cursor default ↵, Claude Code ⌘↵, Codex, Zed, Terminal ⌘T, Reveal in Finder ⌘F) and "Workspace" ("Open Workspace" pushes the workspace command).
- [ ] 3.3 Show toast on missing-binary error from `openInEditor`.
- [ ] 3.4 Empty state: prompt to "Open Folder…" via Raycast's file picker; persist into recents on success.

## 4. Repo Workspace command

- [ ] 4.1 `raycast-extension/src/repo-workspace.tsx` accepts a repo prop (path + name). Renders `<List>` with `<List.Section title="Worktrees">` and `<List.Section title="Branches">`.
- [ ] 4.2 Worktree row: title = branch (mono), subtitle = path short name + ahead/behind, accessories = primary badge + dirty/clean tag.
- [ ] 4.3 Branch row: title = branch, subtitle = sha + ahead/behind, accessory = "no worktree".
- [ ] 4.4 `<ActionPanel>` per worktree row with sections "Open in" + "Git" matching the design (Commit changes via push form, Push, Pull, Merge main → branch, Remove worktree destructive).
- [ ] 4.5 `<ActionPanel>` per branch-without-worktree row: Create worktree… (push a form), Checkout in primary worktree, Open in editor (primary path).
- [ ] 4.6 Commit form (`commit-form.tsx`): multiline message field; on submit run `commitInWorktree` then close the form and show a toast.
- [ ] 4.7 Remove worktree confirmation via `confirmAlert` from `@raycast/api`. If dirty, second confirm for force.

## 5. Verification

- [ ] 5.1 `cd raycast-extension && npm run dev` opens the extension in Raycast dev mode.
- [ ] 5.2 Smoke-test against a real repo with at least 2 worktrees: launcher filters, Open in Cursor works, Workspace push, Commit in worktree, Remove non-primary, Create worktree on a branch.
- [ ] 5.3 Smoke-test missing-binary: rename `cursor` off PATH, confirm a friendly toast instead of a stack trace.

## 6. Documentation

- [ ] 6.1 `raycast-extension/README.md` with: requirements (macOS, Raycast, git, optional editor CLIs), local install steps (`npm install`, `npm run dev`, then "Import Extension" in Raycast), the two commands and their hotkeys.
