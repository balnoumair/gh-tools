## ADDED Requirements

### Requirement: Repository launcher command

The Raycast extension SHALL expose an "Open Repository" command that lists recent repositories and supports search-driven filtering.

#### Scenario: User invokes Open Repository

- **WHEN** the user runs the "Open Repository" Raycast command
- **THEN** the extension SHALL render a list of recent repositories sorted by most-recent-first
- **AND** each row SHALL show repo name, monospace path, current branch, branches count, and a dirty marker when the working copy has uncommitted changes
- **AND** typing in the search field SHALL filter the list by name or path substring (case-insensitive)

#### Scenario: Recents are persisted

- **WHEN** the user opens a repository through the launcher
- **THEN** that repository SHALL be stored in the Raycast extension's `LocalStorage`
- **AND** the recents list SHALL retain at most 20 entries
- **AND** opening a repository already in recents SHALL move it to the front rather than duplicate it

### Requirement: Per-result action panel

Each repository row SHALL surface a ⌘K action panel grouped into "Open in" (editors) and "Workspace" (jump to per-repo view).

#### Scenario: User opens an action panel

- **WHEN** the user presses `⌘K` on a row
- **THEN** the panel SHALL show, in order: "Open in Cursor" (default action, primary), "Open in Claude Code", "Open in Codex", "Open in Zed", "Open in Terminal", "Reveal in Finder", "Open Workspace"
- **AND** "Open Workspace" SHALL push the per-repo workspace command for the selected repository

#### Scenario: Editor binary missing

- **WHEN** the user picks "Open in <editor>" and the editor's CLI binary cannot be resolved on PATH
- **THEN** the extension SHALL show a Raycast toast with a non-success style whose message names the missing binary
- **AND** SHALL NOT throw an unhandled error
