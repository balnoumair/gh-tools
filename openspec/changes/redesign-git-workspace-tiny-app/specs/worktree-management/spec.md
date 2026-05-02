## ADDED Requirements

### Requirement: List worktrees for a repository

The system SHALL list all Git worktrees attached to the active repository, including the primary working tree, with each entry's path, the branch it has checked out, whether it is the primary, and its dirty / ahead / behind status.

#### Scenario: User opens a repository

- **WHEN** the renderer requests repository status
- **THEN** the main process SHALL run `git worktree list --porcelain` against the repository
- **AND** SHALL return one entry per worktree with `path`, `branch`, `primary` (true for the repository's main working tree), `dirty` (true if `git status --porcelain` in that worktree returns any line), `ahead`, and `behind` counts

#### Scenario: Worktree branch is detached

- **WHEN** a worktree has a detached HEAD
- **THEN** the worktree SHALL still be returned
- **AND** its `branch` field SHALL be the short SHA prefixed with `(detached) `
- **AND** its `ahead` and `behind` counts SHALL be `0`

### Requirement: Create a worktree

The system SHALL create a new Git worktree on a chosen branch at a chosen filesystem path.

#### Scenario: User adds a worktree on an existing branch

- **WHEN** the renderer invokes the create-worktree command with a branch name and a target path
- **THEN** the main process SHALL run `git worktree add <path> <branch>`
- **AND** SHALL return a `GitOperationResult` with the worktree's resolved path on success
- **AND** SHALL refresh repository status afterwards

#### Scenario: Target path already exists

- **WHEN** the requested target path already exists on disk
- **THEN** the operation SHALL fail with a non-success result whose message indicates the path conflict
- **AND** SHALL NOT modify the repository

### Requirement: Remove a worktree

The system SHALL remove a non-primary worktree.

#### Scenario: User removes a worktree

- **WHEN** the renderer invokes remove-worktree on a worktree path
- **THEN** the main process SHALL run `git worktree remove <path>`
- **AND** SHALL refresh repository status afterwards

#### Scenario: User attempts to remove the primary worktree

- **WHEN** the renderer invokes remove-worktree on the repository's primary worktree
- **THEN** the main process SHALL refuse with a non-success result whose message indicates the primary cannot be removed
- **AND** the renderer's worktree row SHALL hide the Remove action when `primary` is true

#### Scenario: Worktree has uncommitted changes

- **WHEN** the worktree has uncommitted changes and the user confirms force removal
- **THEN** the main process SHALL run `git worktree remove --force <path>`
- **AND** SHALL refresh repository status afterwards
