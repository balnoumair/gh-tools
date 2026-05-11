# App Shell Specification

## Purpose

Define the Electron shell, window modes, tray behavior, and renderer IPC boundary for gh-viewer. The application is a macOS-oriented menu bar app that opens a compact pull request popover by default and a larger Git Manager window on demand.
## Requirements
### Requirement: Menu bar app lifecycle

The system SHALL run as a tray/menu bar application and SHALL remain alive when windows are closed.

#### Scenario: App starts on macOS

- **WHEN** the app starts on macOS
- **THEN** the dock icon SHALL be hidden
- **AND** the popover window SHALL be created before the tray icon
- **AND** the tray icon SHALL be available for toggling the popover

#### Scenario: All windows are closed

- **WHEN** all app windows are closed
- **THEN** the app SHALL continue running
- **AND** background polling MAY continue until app quit

### Requirement: Tray popover positioning

The system SHALL show a frameless, fixed-size tray popover when the tray icon is clicked.

#### Scenario: User clicks hidden tray popover

- **WHEN** the user clicks the tray icon while the popover is hidden
- **THEN** the app SHALL position the popover under the tray icon
- **AND** the horizontal position SHALL be clamped inside the nearest display work area
- **AND** the app SHALL show and focus the popover

#### Scenario: User clicks visible tray popover

- **WHEN** the user clicks the tray icon while the popover is visible
- **THEN** the app SHALL hide the popover

#### Scenario: Popover loses focus

- **WHEN** the tray popover blurs
- **THEN** the app SHALL hide the popover

### Requirement: Full Git Manager window

The system SHALL provide a Git Manager window sized for the tiny-app layout.

#### Scenario: Full window is requested

- **WHEN** the renderer invokes the open-full-window command
- **THEN** the app SHALL create a Git Manager window if one does not exist
- **AND** SHALL show and focus the existing Git Manager window if it already exists
- **AND** SHALL load the renderer in `full` mode

#### Scenario: Full window sizing

- **WHEN** the Git Manager window is created
- **THEN** its content size SHALL be 380×680 by default
- **AND** its minimum width SHALL be 380 and its minimum height SHALL be 480
- **AND** it SHALL be resizable in height but its width SHALL be locked to 380

#### Scenario: Repo picker / launcher window

- **WHEN** no active repository is selected
- **THEN** the renderer SHALL display a Raycast-style command-bar launcher (search input + recents list)
- **AND** the Git Manager window SHALL widen to 920 × 580 while in launcher mode
- **AND** the window SHALL return to the 380×680 tiny-app size after a repository becomes active

### Requirement: Mode-specific renderer boot

The renderer SHALL choose the active experience from the `mode` query parameter.

#### Scenario: Renderer loads in tray mode

- **WHEN** the renderer receives `mode=tray`
- **THEN** it SHALL render the pull request tray experience

#### Scenario: Renderer loads in full mode

- **WHEN** the renderer receives `mode=full`
- **THEN** it SHALL render the Git Manager experience

#### Scenario: Renderer mode is absent

- **WHEN** no renderer mode is provided
- **THEN** the renderer SHALL default to tray mode

### Requirement: Secure preload API boundary

The system SHALL expose renderer capabilities through a context-isolated preload API.

#### Scenario: Renderer calls main-process behavior

- **WHEN** renderer code needs GitHub, app, or Git functionality
- **THEN** it SHALL use `window.electronAPI`
- **AND** the preload SHALL invoke named IPC channels
- **AND** Node integration SHALL remain disabled in renderer windows
- **AND** context isolation SHALL remain enabled in renderer windows

### Requirement: External URL opening

The system SHALL open external GitHub or web URLs through the Electron shell.

#### Scenario: Renderer requests an external URL

- **WHEN** the renderer invokes the open-external command with a URL
- **THEN** the main process SHALL pass the URL to Electron shell external opening

