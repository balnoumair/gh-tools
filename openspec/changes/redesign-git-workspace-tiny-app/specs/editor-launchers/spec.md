## ADDED Requirements

### Requirement: Launch an external editor against a path

The system SHALL launch an external editor or system tool against a worktree or repository path. Supported targets are Cursor, Claude Code, Codex, Zed, the system Terminal, and Finder.

#### Scenario: User opens a worktree in an editor

- **WHEN** the renderer invokes the open-in-editor command with an editor identifier (`cursor`, `claude`, `codex`, `zed`, `terminal`, `finder`) and a target path
- **THEN** the main process SHALL spawn the appropriate command:
  - `cursor` → `cursor <path>`
  - `claude` → `claude <path>`
  - `codex` → `codex <path>`
  - `zed` → `zed <path>`
  - `terminal` → on macOS, `open -a Terminal <path>`
  - `finder` → on macOS, `open <path>`
- **AND** SHALL detach the spawned process from the Electron main process

#### Scenario: Editor CLI is not installed

- **WHEN** the editor's CLI binary cannot be found on `PATH` (or the platform-specific resolver returns no executable)
- **THEN** the operation SHALL return a non-success `EditorLaunchResult` whose message names the missing editor and the expected binary
- **AND** SHALL NOT throw to the renderer

#### Scenario: Path does not exist

- **WHEN** the requested path does not exist on disk
- **THEN** the operation SHALL return a non-success result whose message indicates the missing path
- **AND** SHALL NOT spawn any process

### Requirement: Editor launcher safety boundary

The system SHALL launch editors only through the main process; the renderer SHALL NOT exec or spawn child processes itself.

#### Scenario: Renderer requests an editor launch

- **WHEN** the renderer needs to open a path in an editor
- **THEN** it SHALL use `window.electronAPI.openInEditor(target, path)`
- **AND** the preload SHALL relay through the editor-open IPC channel
- **AND** Node integration in renderer windows SHALL remain disabled
