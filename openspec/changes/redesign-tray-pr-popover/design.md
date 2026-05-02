## Context

The tray popover lives in the macOS menubar and is the user's at-a-glance "what needs me" view. The current implementation lists every relevant PR (review-requested, mentioned, assigned, authored) with metadata-heavy rows (avatar, repo, number, age, status badge, CI dot, mention label, labels). The design shows a tighter direction: only the two relationships that actually drive action ("Review requested", "Your PRs"), with a single CI dot pinned to a fixed-width slot at the right edge so dot column-alignment never breaks across rows of differing text width. The popover loses its footer and external "Open Git Manager" affordance — the new Raycast launcher is the entry point for "do something else with this repo".

## Goals / Non-Goals

**Goals**
- Reduce the popover to the two relationships users act on most.
- Stable visual rhythm: every row's CI dot lands in the same horizontal slot.
- Calm chrome: header only (label, count, refresh) + list. No footer.
- Adopt the design's translucent macOS-style surface tokens.

**Non-Goals**
- No backend/poller changes. The poller still discovers all four mention types; we only filter at render.
- No new IPC channels. No notifications behavior change.
- Full Git Manager redesign is a separate change (`redesign-git-workspace-tiny-app`).

## Decisions

- **Filter at the renderer, not the poller.** The poller's relevance set is broader than the popover's display set on purpose: notifications, ETag re-use, and downstream consumers all depend on the broader set. Filtering only at the tray view keeps the change surgical.
- **Order is fixed: review-requested then authored.** Within each group preserve the poller's `updatedAt`-descending order. This matches the design and the user's stated mental model ("what needs me, then what I own").
- **Drop the `TrayFooter` component entirely** rather than gut it. The header already shows the count; the macOS menubar shows the time.
- **Drop the `TrayHeader` external "Open Git Manager" button.** With the launcher app as the entry point, this affordance is redundant. Keep `IPC.APP_OPEN_FULL_WINDOW` itself (no IPC change); other call sites or future flows may still need it.
- **CI dot uses `.gh-dot`-style absolute slot.** Use `flex: 0 0 auto` plus a fixed 8px width container at the row's far right. The dot itself is `vertical-align: middle` with a -0.5px nudge so it sits on the text baseline — the same fix the design references.
- **Surface tokens.** Add a `bg-mac-bg-popover-translucent` token (rgba(20,20,22,0.78) + backdrop-blur 40px sat 140%) plus a 14px corner radius for the popover shell. Don't change the global popover token because the existing one is also referenced by other menus.

## Risks / Trade-offs

- Hiding "mentioned" and "assigned" PRs is a behavior loss. Mitigation: notifications still fire for all relevance types, and they are still reachable via the GitHub URL the notification opens. We can revisit if user feedback wants them back as a collapsible group.
- The translucent backdrop only renders on macOS with `vibrancy` window settings. On Windows/Linux Electron the translucency degrades to a solid dark; acceptable since the app targets macOS.

## Migration Plan

Single PR. No data migration. Component-level changes only.

## Open Questions

None.
