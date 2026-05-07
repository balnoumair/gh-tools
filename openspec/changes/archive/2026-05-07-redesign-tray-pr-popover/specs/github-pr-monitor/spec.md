## MODIFIED Requirements

### Requirement: Tray pull request list

The tray experience SHALL display authentication state, the filtered pull request list, refresh state, and empty/error states. The popover SHALL render only pull requests where the user is requested for review or where the user is the author; pull requests where the user is only mentioned or assigned SHALL NOT appear in the popover. Pull requests SHALL be ordered with all `review_requested` entries first, followed by all `authored` entries; within each group entries SHALL retain the order produced by the poller.

#### Scenario: User is unauthenticated

- **WHEN** auth status is unauthenticated
- **THEN** the tray SHALL show a GitHub connection prompt
- **AND** SHALL indicate that users may authenticate with `gh auth login` or a personal access token

#### Scenario: Pull requests are available

- **WHEN** the tray has pull requests with mention type `review_requested` or `authored`
- **THEN** the tray SHALL render each visible pull request as a row with the author avatar, repository short name, PR number, title, a relationship pill ("Review requested" or "Your PRs"), and a CI status dot pinned to a fixed-width slot at the row's right edge
- **AND** the tray SHALL NOT render a relative-age timestamp on the row
- **AND** clicking a row SHALL open the pull request URL externally

#### Scenario: Pull requests are filtered out

- **WHEN** the underlying pull request list contains entries whose mention type is `mentioned` or `assigned`
- **THEN** those entries SHALL NOT be rendered in the tray popover
- **AND** the tray header count SHALL reflect only the rendered (review_requested + authored) total

#### Scenario: Pull request list is empty after filtering

- **WHEN** no pull requests with mention type `review_requested` or `authored` are available
- **THEN** the tray SHALL show an all-caught-up empty state

#### Scenario: Refresh fails in the renderer store

- **WHEN** fetching or refreshing pull requests fails
- **THEN** the tray SHALL show an error state
- **AND** SHALL offer a retry action that forces a refresh

#### Scenario: CI status dot alignment

- **WHEN** a row is rendered with a CI status of `success`, `failure`, `pending`, or `unknown`
- **THEN** the dot SHALL occupy a fixed 8px slot at the right edge of the row
- **AND** the dot's vertical position SHALL sit on the text baseline so the dot does not displace surrounding text

#### Scenario: Tray header chrome

- **WHEN** the tray popover is visible
- **THEN** the header SHALL show a branch glyph, the "Pull requests" label, the visible count, and a single refresh affordance
- **AND** the header SHALL NOT include an "Open Git Manager" external button
- **AND** the popover SHALL NOT render a footer with open count or last-refreshed time
