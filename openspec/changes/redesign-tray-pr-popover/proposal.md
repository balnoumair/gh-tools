## Why

The tray PR popover currently shows a flat, undifferentiated list with all mention types mixed in, redundant header chrome, and a CI status dot whose alignment shifts as adjacent age text changes width. The redesign tightens this to a calmer, more native macOS menubar feel: only the two relationships users act on most ("Review requested" and "Your PRs"), in that order; CI dot pinned to a fixed-width slot at the row's right edge; redundant footer/external buttons removed because the launcher app now handles "open elsewhere".

## What Changes

- Render only PRs whose mention type is `review_requested` or `authored`; drop `mentioned` and `assigned` from the popover. Order is review-requested first, then authored.
- **BREAKING** UI: tray no longer shows "mentioned" or "assigned" PRs in the popover (data still flows from the poller; only the rendered set changes).
- Remove the relative-age timestamp from each PR row.
- Keep the CI dot per row, but lock it to a fixed slot at the far-right of the row so it column-aligns across rows regardless of other content.
- Fix the CI dot's vertical baseline so it sits on the line of accompanying text instead of pushing it.
- Remove the popover footer entirely (the open-count and time were redundant with the header count and the macOS menubar clock).
- Remove the "Open Git Manager" external button from the tray header; the Raycast-style launcher is the new entry point.
- Adopt the design's translucent dark surface (rgba(20,20,22,0.78) + backdrop-blur), 14px corner radius, and hairline borders for the popover container.
- Header shows the branch glyph, "Pull requests" label, count, and a single refresh button.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `github-pr-monitor`: Tray pull request list rendering rules change (filtered relationship set, no age text per row, fixed-slot CI dot, no footer, no Git-Manager external button).

## Impact

- Affected code: `src/renderer/views/TrayApp.tsx`, `src/renderer/components/tray/PRList.tsx`, `src/renderer/components/tray/PRItem.tsx`, `src/renderer/components/tray/TrayHeader.tsx`, `src/renderer/components/tray/TrayFooter.tsx` (deleted), `src/renderer/components/tray/PRStatusBadge.tsx`, `src/index.css` (popover surface tokens).
- No IPC, no main-process services, no new dependencies.
- Tests: tray unit tests in `test/` may need updates for filtering and removed elements.
