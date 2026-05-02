# Tasks

## 1. Filter and order the rendered PR set

- [ ] 1.1 In `src/renderer/components/tray/PRList.tsx`, derive the visible list from the store: `prs.filter(p => p.mentionType === 'review_requested' || p.mentionType === 'authored')` then stable-sort so all `review_requested` come first.
- [ ] 1.2 Update the empty-state condition to use the filtered list (so "All caught up" appears when the filtered set is empty even if the store has mentioned/assigned entries).

## 2. Redesign the row

- [ ] 2.1 In `src/renderer/components/tray/PRItem.tsx`, remove the relative-age timestamp (`timeAgo(pr.updatedAt)` and its element).
- [ ] 2.2 Replace the trailing `mentionLabel` text with a relationship pill: "Review requested" for `review_requested`, "Your PRs" for `authored`. Use a low-contrast pill: rgba(255,255,255,0.03) background, 1px hairline, secondary fg.
- [ ] 2.3 Move the CI status dot into a fixed 8px right-edge slot on the meta row (top of the card, next to repo + #num), not on the bottom badge row. The slot SHALL be `flex: 0 0 auto` + `width: 8px` so its position stays stable across rows.
- [ ] 2.4 Apply baseline-aligned dot styling: `vertical-align: middle; position: relative; top: -0.5px`. Keep existing CI color mapping (success → green, failure → red, pending → orange-pulsing, unknown → tertiary).
- [ ] 2.5 Drop the labels strip (`pr.labels`) — design shows a calmer row.

## 3. Header and footer chrome

- [ ] 3.1 In `src/renderer/components/tray/TrayHeader.tsx`, remove the "Open Git Manager" external button and its handler. The header SHALL show: branch glyph, "Pull requests" label, monospace count of the visible (filtered) list, and a single refresh button on the right.
- [ ] 3.2 Move the refresh affordance from `TrayFooter` into `TrayHeader` (single icon button, monospace-style ghost). It SHALL trigger `usePRStore().forceRefresh()` and animate its glyph while `isRefreshing`.
- [ ] 3.3 Delete `src/renderer/components/tray/TrayFooter.tsx`.
- [ ] 3.4 In `src/renderer/views/TrayApp.tsx`, remove the `<TrayFooter />` mount and any layout that depended on its presence (border-top, etc.).

## 4. Surface styling

- [ ] 4.1 In `src/index.css`, add a `--mac-bg-popover-translucent` token = `rgba(20,20,22,0.78)` and a class `.bg-mac-popover-translucent` that applies it plus `backdrop-filter: blur(40px) saturate(140%);`.
- [ ] 4.2 In `src/renderer/views/TrayApp.tsx`, swap the root background from `bg-mac-bg-sidebar` to the new translucent class and add a 14px outer radius + 1px hairline border. Keep `overflow-hidden` so the rounded corners clip children.
- [ ] 4.3 In `src/main/windows.ts` (popover window), set `transparent: true` and `vibrancy: 'menu'` (already supported on macOS) so the translucent surface composites over the desktop wallpaper. Skip on non-darwin platforms.

## 5. Tests

- [ ] 5.1 Update `test/renderer/PRList.test.tsx` (or equivalent) to assert mentioned/assigned PRs are filtered out and ordering is review-requested-then-authored.
- [ ] 5.2 Update `test/renderer/PRItem.test.tsx` to assert the row no longer renders the age timestamp and that the CI dot is in the fixed-slot position.
- [ ] 5.3 Remove or move any `TrayFooter.test.tsx` to cover the new `TrayHeader` refresh button.

## 6. Verification

- [ ] 6.1 `pnpm build` succeeds.
- [ ] 6.2 `pnpm test` passes.
- [ ] 6.3 `pnpm start` and visually verify popover against `gh-viewer/project/GH Viewer Redesign.html` Popover A artboard: alignment, chrome, translucency, baseline of CI dot.
