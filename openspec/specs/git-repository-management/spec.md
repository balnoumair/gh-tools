# Git Repository Management Specification

## Purpose

Define the local Git repository management capabilities exposed by the full gh-viewer window. The Git Manager helps users select repositories, inspect branches and stashes, and run common Git operations through main-process services.
## Requirements
### Requirement: Repository selection

The system SHALL allow users to select and reopen local Git repositories.

#### Scenario: User selects a repository folder

- **WHEN** the user opens the repository picker
- **THEN** the app SHALL show an open-directory dialog
- **AND** SHALL accept a folder that contains `.git` or passes Git repository detection
- **AND** SHALL return the repository path and folder name
- **AND** SHALL refresh repository status after selection

#### Scenario: User opens a recent repository

- **WHEN** the user selects a recent repository
- **THEN** the Git Manager SHALL set it as the active repository
- **AND** SHALL refresh repository status

#### Scenario: Repository is opened

- **WHEN** a repository becomes active
- **THEN** it SHALL be stored in the recent repository list
- **AND** the recent repository list SHALL retain at most 10 entries
- **AND** duplicate paths SHALL be moved to the front rather than duplicated

### Requirement: Repository status summary

The system SHALL expose repository branch, stash, worktree, and working-copy status for the active repository.

#### Scenario: Status is requested

- **WHEN** repository status is refreshed
- **THEN** the main process SHALL collect all local and remote branches
- **AND** SHALL collect current branch information
- **AND** SHALL collect stash entries
- **AND** SHALL collect ahead and behind counts for the current branch
- **AND** SHALL collect untracked, staged, modified, and conflict counts
- **AND** SHALL collect the worktree list with each entry's path, branch, primary flag, dirty status, and ahead/behind counts

#### Scenario: Branch list is built

- **WHEN** branches are returned from Git
- **THEN** the system SHALL omit detached HEAD pseudo-branches
- **AND** SHALL mark remote branches with their remote name
- **AND** SHALL shorten commit hashes to 8 characters for display

### Requirement: Branch browsing

The Git Manager SHALL present searchable local and remote branch groups.

#### Scenario: Branch filter changes

- **WHEN** the user types in the branch filter
- **THEN** the branch panel SHALL show only branches whose names include the filter text case-insensitively
- **AND** SHALL keep local branches separate from remote branches grouped by remote

#### Scenario: User double-clicks a non-current branch

- **WHEN** the user double-clicks a branch that is not current
- **THEN** the system SHALL attempt to check out that branch
- **AND** SHALL refresh repository status after a successful checkout

#### Scenario: User checks out a remote branch

- **WHEN** the requested branch name identifies a remote branch
- **THEN** the system SHALL create a local branch with the remote branch name minus the remote prefix
- **AND** SHALL track the corresponding remote ref

### Requirement: Branch creation and deletion

The system SHALL support local branch creation and deletion.

#### Scenario: User creates a branch

- **WHEN** the user submits a branch name
- **THEN** the system SHALL create and switch to a new local branch
- **AND** SHALL reset it to the selected start point if one was supplied
- **AND** SHALL close the create-branch dialog
- **AND** SHALL refresh repository status after success

#### Scenario: User deletes a local branch

- **WHEN** the user requests branch deletion
- **THEN** the system SHALL run safe deletion by default
- **AND** SHALL run force deletion when the force option is requested
- **AND** SHALL refresh repository status after success

### Requirement: Fetch and update

The system SHALL support fetching and pulling from remotes.

#### Scenario: User fetches

- **WHEN** the user invokes fetch
- **THEN** the system SHALL fetch from the selected remote or `origin`
- **AND** SHALL prune stale remote-tracking refs
- **AND** SHALL refresh repository status after success

#### Scenario: User updates by merge

- **WHEN** the user updates with merge strategy
- **THEN** the system SHALL pull the current branch from the selected remote using merge behavior
- **AND** SHALL refresh repository status after success

#### Scenario: User updates by rebase

- **WHEN** the user updates with rebase strategy
- **THEN** the system SHALL pull the current branch from the selected remote with rebase behavior
- **AND** SHALL refresh repository status after success

### Requirement: Push

The system SHALL support pushing the active branch to a selected remote.

#### Scenario: User pushes current branch

- **WHEN** the user submits the push dialog
- **THEN** the system SHALL push the current branch to the selected remote or `origin`
- **AND** SHALL include `--no-verify` when skipping pre-push hooks is selected
- **AND** SHALL include upstream setup when requested
- **AND** SHALL refresh repository status after success

### Requirement: Merge

The system SHALL support merging another local branch into the current branch.

#### Scenario: User merges a branch

- **WHEN** the user selects a source branch to merge
- **THEN** the system SHALL check out the current target branch if needed
- **AND** SHALL merge the source branch into the target branch
- **AND** SHALL use no-fast-forward when requested
- **AND** SHALL append merge output to the operation log
- **AND** SHALL refresh repository status when the operation completes

#### Scenario: Merge conflicts occur

- **WHEN** Git reports a merge conflict
- **THEN** the operation result SHALL be unsuccessful
- **AND** the result message SHALL indicate that conflicts must be resolved manually

### Requirement: Stash management

The system SHALL support creating, applying, popping, and dropping stashes.

#### Scenario: User creates a stash

- **WHEN** the user submits the stash creation dialog
- **THEN** the system SHALL create a stash with an optional message
- **AND** SHALL include untracked files when requested
- **AND** SHALL close the stash creation dialog
- **AND** SHALL refresh repository status after success

#### Scenario: User applies a stash

- **WHEN** the user applies a stash
- **THEN** the system SHALL apply `stash@{index}`
- **AND** SHALL keep the stash entry
- **AND** SHALL refresh repository status after success

#### Scenario: User pops a stash

- **WHEN** the user pops a stash
- **THEN** the system SHALL apply `stash@{index}`
- **AND** SHALL drop the stash entry if the pop succeeds
- **AND** SHALL refresh repository status after success

#### Scenario: User drops a stash

- **WHEN** the user drops a stash
- **THEN** the system SHALL delete `stash@{index}`
- **AND** SHALL refresh repository status after success

### Requirement: Focus refresh

The full Git Manager SHALL refresh repository status when the window regains focus.

#### Scenario: Active repository window gains focus

- **WHEN** the full window is focused and an active repository exists
- **THEN** the renderer SHALL refresh repository status

### Requirement: Tiny-app workspace layout

The Git Manager SHALL render the active repository as a 380×680 single-pane vertical stack: title bar → primary toolbar → current-branch summary → Worktrees section → Local branches → Remote branches → Stash → footer.

#### Scenario: Repository is active

- **WHEN** an active repository exists
- **THEN** the Git Manager SHALL render the title bar with the repository name as a breadcrumb under the "Git Manager" label
- **AND** SHALL render a primary toolbar with: Commit (primary, white pill, monospace badge for the staged count when > 0), Push, Sync (merge upstream into current branch), Fetch (icon-only)
- **AND** SHALL render a current-branch summary strip showing branch name, ahead/behind counts, and a dirty indicator
- **AND** SHALL render a Worktrees section, a Local branches section, a Remote branches section, and a Stash section in that order
- **AND** SHALL render a footer with the repository path and an "N changed" indicator

#### Scenario: Section collapsing defaults

- **WHEN** the workspace first opens for a repository
- **THEN** the Worktrees and Local sections SHALL be expanded
- **AND** the Remote and Stash sections SHALL be collapsed

### Requirement: Worktree row affordances

Each worktree row in the Worktrees section SHALL expose an inline editor strip and a single overflow menu of Git actions for that worktree.

#### Scenario: User opens a worktree in an editor

- **WHEN** the user clicks an editor button on a worktree row (Cursor / Claude / Codex / Zed / Terminal)
- **THEN** the renderer SHALL invoke the editor-launcher with the worktree's path and that editor identifier

#### Scenario: Worktree has uncommitted changes

- **WHEN** a worktree row reports `dirty: true`
- **THEN** its overflow menu SHALL include a "Commit changes" item
- **AND** selecting that item SHALL expand an inline composer below the row containing a textarea, a "N staged · ↑M" hint, a Commit primary action, an "& Push" combo action, and a Cancel action
- **AND** Commit SHALL stage and commit changes in that worktree using the entered message; "& Push" SHALL additionally push the worktree's branch on success

#### Scenario: Worktree is behind upstream

- **WHEN** a worktree row reports `behind > 0`
- **THEN** its overflow menu SHALL include a "Merge main → <branch>" item
- **AND** selecting that item SHALL run merge against that worktree

#### Scenario: Primary worktree

- **WHEN** the worktree row's `primary` flag is true
- **THEN** its overflow menu SHALL NOT include a "Remove worktree" item

