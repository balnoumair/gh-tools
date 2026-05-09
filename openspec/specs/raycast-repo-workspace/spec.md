# raycast-repo-workspace Specification

## Purpose
TBD - created by archiving change add-raycast-extension. Update Purpose after archive.
## Requirements
### Requirement: Repo workspace command

The Raycast extension SHALL expose a per-repository workspace command that lists worktrees and branches for the selected repository, with per-row Git and editor actions.

#### Scenario: User opens the workspace for a repository

- **WHEN** the user reaches the workspace command (either pushed from the launcher or invoked directly with a remembered repo)
- **THEN** the view SHALL show two sections: "Worktrees" and "Branches"
- **AND** the Worktrees section SHALL include each worktree with the worktree's branch (monospace), a primary badge if the worktree is primary, the linked PR number if known, the directory short name, and the worktree's modified / clean status
- **AND** the Branches section SHALL include local branches that have no worktree, each with monospace branch name, short SHA, and ahead/behind counts

#### Scenario: User filters within the workspace

- **WHEN** the user types in the search field
- **THEN** items SHALL be filtered by branch name or path substring (case-insensitive) across both sections

### Requirement: Per-row action panel

Each row SHALL expose a ⌘K action panel with an "Open in" group and a "Git" group whose contents match the Electron tiny-app's worktree row.

#### Scenario: User opens the action panel on a worktree row

- **WHEN** the user presses `⌘K` on a worktree row
- **THEN** the panel SHALL show, in order:
  - **Open in**: Cursor (`↵`, default), Claude Code (`⌘↵`), Codex, Zed, Terminal (`⌘T`), Reveal in Finder (`⌘F`)
  - **Git**: Commit changes… (`⌘C`), Push (`⌘U`), Pull, Merge main → branch, Remove worktree (destructive, `⌘⌫`)
- **AND** the primary action label and shortcut SHALL appear at the bottom-left of the workspace footer

#### Scenario: User commits from a row

- **WHEN** the user picks "Commit changes…" on a dirty worktree row
- **THEN** the extension SHALL push a Raycast Form view with a multiline message field
- **AND** submitting the form SHALL run `git -C <worktree-path> add -A && git commit -m <message>`
- **AND** SHALL show a success toast on completion or a failure toast on error

#### Scenario: User removes a worktree

- **WHEN** the user picks "Remove worktree" on a non-primary row
- **THEN** the extension SHALL prompt for confirmation via a Raycast confirm alert
- **AND** on confirmation SHALL run `git -C <repo-path> worktree remove <worktree-path>` (with `--force` if the worktree is dirty and the user confirms again)

#### Scenario: User picks an action on a branch row that has no worktree

- **WHEN** the user opens the action panel on a branch-without-worktree row
- **THEN** the panel's actions SHALL be limited to: "Create worktree…" (push a form to choose a target path), "Checkout in primary worktree", "Open in <editor> (primary worktree)" — destructive Git actions SHALL be hidden

