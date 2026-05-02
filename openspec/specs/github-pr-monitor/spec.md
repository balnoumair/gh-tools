# GitHub Pull Request Monitor Specification

## Purpose

Define authentication, polling, notification, and tray-list behavior for monitoring GitHub pull requests that are relevant to the current user.

## Requirements

### Requirement: GitHub authentication sources

The system SHALL authenticate GitHub API requests by preferring the GitHub CLI token and falling back to an encrypted manually stored token.

#### Scenario: GitHub CLI is authenticated

- **WHEN** a GitHub token is available from `gh auth token`
- **THEN** the system SHALL use that token for API access
- **AND** SHALL set the auth source to `gh-cli`
- **AND** SHALL attempt to fetch the username with `gh api user --jq .login`
- **AND** SHALL cache the token and username for subsequent calls

#### Scenario: GitHub CLI token is unavailable

- **WHEN** no GitHub CLI token can be obtained
- **THEN** the system SHALL attempt to load a manually stored token from the app user data directory
- **AND** SHALL decrypt the token with Electron safeStorage
- **AND** SHALL set the auth source to `manual` if the token is available

#### Scenario: No token is available

- **WHEN** neither GitHub CLI nor stored manual token authentication succeeds
- **THEN** the auth status SHALL report `authenticated: false`
- **AND** the tray SHALL show the authentication prompt

### Requirement: Manual token storage

The system SHALL persist manually entered GitHub tokens using Electron safeStorage.

#### Scenario: User submits a personal access token

- **WHEN** the user enters a non-empty token in the authentication prompt
- **THEN** the main process SHALL require safeStorage encryption availability
- **AND** SHALL encrypt the token
- **AND** SHALL write it to `.gh-token` under the app user data directory
- **AND** SHALL update the auth status to authenticated with source `manual`
- **AND** SHALL start pull request polling

### Requirement: Pull request polling

The system SHALL poll GitHub for open pull requests relevant to the authenticated user.

#### Scenario: Polling starts

- **WHEN** polling starts
- **THEN** the system SHALL immediately refresh pull requests
- **AND** SHALL continue refreshing on the configured interval

#### Scenario: Poll interval changes

- **WHEN** the user sets a poll interval in minutes
- **THEN** the system SHALL clamp the interval to the inclusive range from 1 to 60 minutes
- **AND** SHALL restart active polling with the new interval

### Requirement: Relevant pull request discovery

The system SHALL discover pull requests where the user is requested for review, mentioned, assigned, or is the author.

#### Scenario: Refresh fetches GitHub search results

- **WHEN** the system refreshes pull requests
- **THEN** it SHALL query open pull requests for `review-requested:@me`
- **AND** SHALL query open pull requests for `mentions:@me`
- **AND** SHALL query open pull requests for `assignee:@me`
- **AND** SHALL query open pull requests for `author:@me`

#### Scenario: Pull requests overlap across queries

- **WHEN** the same pull request appears in more than one query result
- **THEN** the system SHALL keep a single pull request entry keyed by GitHub issue id
- **AND** SHALL keep the first mention type encountered by the query order

#### Scenario: Pull request list is prepared

- **WHEN** query results have been merged
- **THEN** the system SHALL sort pull requests by `updatedAt` descending
- **AND** SHALL include repository name, PR number, title, URL, author, draft state, labels, and mention type

### Requirement: ETag use for review-requested query

The system SHALL reuse the latest GitHub ETag for the review-requested search query.

#### Scenario: Review-requested response includes ETag

- **WHEN** GitHub returns an ETag header for the review-requested search response
- **THEN** the system SHALL store that ETag
- **AND** SHALL send it as `If-None-Match` on later review-requested searches

### Requirement: Pull request refresh resilience

The system SHALL preserve the latest successful pull request list when a refresh fails.

#### Scenario: GitHub refresh fails

- **WHEN** an authenticated refresh throws an error
- **THEN** the system SHALL return the cached pull request list
- **AND** SHALL not clear previously displayed pull requests

### Requirement: New pull request notifications

The system SHALL notify the user only for pull requests not seen in a prior non-empty refresh.

#### Scenario: New pull request appears after initial refresh

- **WHEN** a refresh returns a pull request id that was absent from the previous id set
- **AND** the previous id set was not empty
- **THEN** the system SHALL show a native notification
- **AND** the notification SHALL include the pull request number, repository, author, and title

#### Scenario: User clicks notification

- **WHEN** the user clicks a pull request notification
- **THEN** the app SHALL open the pull request URL externally
- **AND** SHALL release the notification reference

### Requirement: Tray pull request list

The tray experience SHALL display authentication state, pull request state, refresh state, and empty/error states.

#### Scenario: User is unauthenticated

- **WHEN** auth status is unauthenticated
- **THEN** the tray SHALL show a GitHub connection prompt
- **AND** SHALL indicate that users may authenticate with `gh auth login` or a personal access token

#### Scenario: Pull requests are available

- **WHEN** the tray has pull requests
- **THEN** it SHALL render each pull request with repository, number, relative update age, title, author avatar, status badge, mention label, and up to three labels
- **AND** clicking an item SHALL open the pull request URL externally

#### Scenario: Pull request list is empty

- **WHEN** the authenticated pull request list is empty
- **THEN** the tray SHALL show an all-caught-up empty state

#### Scenario: Refresh fails in the renderer store

- **WHEN** fetching or refreshing pull requests fails
- **THEN** the tray SHALL show an error state
- **AND** SHALL offer a retry action that forces a refresh

### Requirement: Push updates to tray renderer

The main process SHALL push refreshed pull request lists to the tray renderer.

#### Scenario: Poller receives updated pull requests

- **WHEN** the poller refreshes pull requests
- **THEN** the main process SHALL send the updated list over the pull-request-updated IPC channel if the popover exists
- **AND** the tray store SHALL update its pull request list and last-refreshed timestamp
