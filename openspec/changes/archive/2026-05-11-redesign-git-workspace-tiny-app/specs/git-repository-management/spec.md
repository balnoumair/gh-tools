## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Operation state and output

**Reason**: The standalone Output panel is removed in the tiny-app redesign. Operation results are now surfaced inline (per-row hints, transient toast on the toolbar) rather than persisted in a 200-line log panel. The store still tracks `operationStatus` and `lastResult`, but no `outputLog` array is required.

**Migration**: Replace any UI that read `outputLog` with the inline hint flow on the relevant worktree or branch row, or with the transient toast pattern attached to the toolbar.

## ADDED Requirements

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
