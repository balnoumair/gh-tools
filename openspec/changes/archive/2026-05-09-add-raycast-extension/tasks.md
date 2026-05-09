# Tasks

## 1. Bootstrap the extension package

- [x] 1.1 Create `raycast-extension/` at the repo root. Inside it run `npx create-raycast-extension` (or set up the boilerplate manually) targeting TypeScript.
- [x] 1.2 Configure `package.json` with two `commands`: `open-repository` (mode: `view`, name: "Open Repository") and `repo-workspace` (mode: `view`, name: "Repo Workspace", but invoked via `push` from the launcher).
- [x] 1.3 Add dev dependencies: `execa`, `@types/node`. Use Raycast-provided React types from `@raycast/api`.

## 2. Shared utilities

- [x] 2.1 `raycast-extension/src/lib/git.ts`: `listWorktrees(repoPath)`, `listBranches(repoPath)`, `getRepoStatus(repoPath)`, `commitInWorktree(path, message)`, `removeWorktree(repoPath, wtPath, force?)`, `createWorktree(repoPath, branch, target)`, `merge(repoPath, branch)`. *(Implemented as `listWorktrees` / `listBranches` / `commitInWorktree` / `pushWorktree` / `pullWorktree` / `mergeMainInto` / `removeWorktree` / `createWorktree` / `checkoutInPrimary` / `detectRepo`. `getRepoStatus` was inlined into the launcher's metadata reader (`readRepoMeta` in `open-repository.tsx`) since the workspace view derives its status from `listWorktrees` directly.)*
- [x] 2.2 `raycast-extension/src/lib/editor.ts`: `openInEditor(target, path)` dispatching per target — Cursor/Zed via `which <bin>` + detached spawn; Codex Desktop via `codex app <path>`; Claude Code via `open "claude://code/new?folder=<urlencoded-path>"`; Terminal via `open -a Terminal <path>`; Finder via `open <path>`. Each branch surfaces a target-specific failure toast (missing PATH binary, missing `Claude.app`, non-zero `open` exit). Include a comment on the Claude branch pointing at the design.md note about the internal URL route.
- [x] 2.3 `raycast-extension/src/lib/recents.ts`: `loadRecents()`, `addRecent(repo)`, `removeRecent(path)` backed by `LocalStorage` (key `recents`, max 20 entries).

## 3. Open Repository command

- [x] 3.1 `raycast-extension/src/open-repository.tsx`: `<List>` with `searchBarPlaceholder="Search recent repos…"`. Each `<List.Item>` shows repo name, accessory with branch + dirty dot. *(Title = repo name, subtitle = path. Accessories include branch tag, branches count, and a dirty tag when applicable. Note: Raycast's `List.Item` doesn't support monospace titles, so the "monospace path" affordance from the spec is delivered via the row's subtitle.)*
- [x] 3.2 `<ActionPanel>` per item with sections "Open in" (Cursor default ↵, Claude Code ⌘↵, Codex, Zed, Terminal ⌘T, Reveal in Finder ⌘F) and "Workspace" ("Open Workspace" pushes the workspace command). *(Plus a "Recents" section with Open Folder… and Remove from Recents ⌃X.)*
- [x] 3.3 Show toast on missing-binary error from `openInEditor`.
- [x] 3.4 Empty state: prompt to "Open Folder…" via Raycast's file picker; persist into recents on success. *(Implemented via a `Form` with a `<Form.FilePicker canChooseDirectories>`; Raycast does not expose a free-floating folder picker.)*

## 4. Repo Workspace command

- [x] 4.1 `raycast-extension/src/repo-workspace.tsx` accepts a repo prop (path + name). Renders `<List>` with `<List.Section title="Worktrees">` and `<List.Section title="Branches">`. *(Also exports a default command-mode entry that defaults to the most-recent repo when invoked standalone from Raycast.)*
- [x] 4.2 Worktree row: title = branch (mono), subtitle = path short name + ahead/behind, accessories = primary badge + dirty/clean tag. *(Title is the branch label; Raycast `List.Item` doesn't render monospace titles, so the visual mono affordance is dropped per Raycast capability.)*
- [x] 4.3 Branch row: title = branch, subtitle = sha + ahead/behind, accessory = "no worktree". *(Ahead/behind for orphan branches is omitted — computing it cheaply requires per-branch checkout context. Worktree rows already show ahead/behind.)*
- [x] 4.4 `<ActionPanel>` per worktree row with sections "Open in" + "Git" matching the design (Commit changes via push form, Push, Pull, Merge main → branch, Remove worktree destructive).
- [x] 4.5 `<ActionPanel>` per branch-without-worktree row: Create worktree… (push a form), Checkout in primary worktree, Open in editor (primary path).
- [x] 4.6 Commit form (`commit-form.tsx`): multiline message field; on submit run `commitInWorktree` then close the form and show a toast.
- [x] 4.7 Remove worktree confirmation via `confirmAlert` from `@raycast/api`. If dirty, second confirm for force.

## 5. Verification

- [x] 5.1 `cd raycast-extension && npm run dev` opens the extension in Raycast dev mode. *(Confirmed end-to-end: extension loads, both commands appear (now collapsed to one — `Open Repository` only), search-driven recents render with metadata. Resolved a Raycast-runtime PATH issue along the way: Raycast spawns extension processes with a stripped PATH, so all `git` and editor invocations were ENOENTing. Fixed by `src/lib/path-fix.ts` which prepends standard macOS bin locations on module load.)*
- [ ] 5.2 Smoke-test against a real repo with at least 2 worktrees: launcher filters, Open in Cursor works, Workspace push, Commit in worktree, Remove non-primary, Create worktree on a branch. *(Partial: launcher filtering, Open in <editor> targets (Claude Code via `claude://code/new?folder=…`, Cursor, Codex via `codex app`, Terminal, Finder), and Workspace push all confirmed against `gh-tools` (3 worktrees). Commit / Remove worktree / Create worktree forms NOT yet hands-on tested — pending follow-up.)*
- [ ] 5.3 Smoke-test launcher failure modes: (a) rename `cursor` off PATH and confirm a missing-binary toast; (b) rename/remove `Claude.app` (or simulate it) and confirm the Claude Code branch surfaces a friendly toast instead of a stack trace; (c) confirm `codex` missing from PATH also surfaces a toast. *(Partial: incidentally hit `spawn git ENOENT` due to Raycast's stripped PATH — confirmed the failure-toast plumbing works end-to-end (toast title surfaces the repo name, body surfaces the underlying stderr, dev console gets full structured error). Full a/b/c missing-binary matrix not yet exercised — pending follow-up.)*

## 6. Documentation

- [x] 6.1 `raycast-extension/README.md` with: requirements (macOS, Raycast, git, optional editor CLIs), local install steps (`npm install`, `npm run dev`, then "Import Extension" in Raycast), the two commands and their hotkeys.
