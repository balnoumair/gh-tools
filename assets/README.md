# App icons

Each Electron product has its own artwork under `assets/<app>/`. These are
committed PNG/ICNS files — edit or replace them directly.

| File | Use |
|------|-----|
| `git-manager/icon.png` / `git-manager/icon.icns` | Git Manager app + dock |
| `pr-pulse/icon.png` / `pr-pulse/icon.icns` | PR Pulse app |
| `pr-pulse/tray-template.png` / `@2x` | PR Pulse macOS menu-bar icon (monochrome template) |
| `../raycast-extension/assets/icon.png` | Raycast extension (a copy of the Git Manager icon) |

To change an icon, replace the relevant file(s). For macOS, `icon.icns` is the
packaged app icon (build one from a 1024×1024 PNG with `iconutil`); `icon.png`
is the dock/runtime icon. The menu-bar `tray-template.png` must be black on a
transparent background so macOS can recolor it for light/dark menu bars. If you
update the Git Manager icon, copy it to the Raycast path above to keep them in
sync.
