# App icons

Each Electron product has its own artwork under `assets/<app>/`.

| File | Use |
|------|-----|
| `git-manager/icon-source.png` | Git Manager master artwork (1024×1024) |
| `git-manager/icon.png` / `git-manager/icon.icns` | Git Manager app + dock |
| `pr-pulse/icon-source.png` | PR Pulse master artwork (1024×1024) |
| `pr-pulse/icon.png` / `pr-pulse/icon.icns` | PR Pulse app |
| `../raycast-extension/assets/extension-icon.png` | Raycast (shares Git Manager art; refreshed by `pnpm icons`) |

The current `*-source.png` files are generated placeholders. To recreate them:

```bash
python3 scripts/generate-placeholder-sources.py
```

To rebuild `icon.png` / `icon.icns` (and the Raycast icon) from the sources —
drop in real artwork at `assets/<app>/icon-source.png` first, then:

```bash
pnpm icons                                    # both apps
bash scripts/generate-icons.sh git-manager    # just one
```
