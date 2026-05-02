## MODIFIED Requirements

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
