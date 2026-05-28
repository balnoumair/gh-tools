#!/usr/bin/env bash
# Regenerate packaged icons for each Electron product from its source PNG.
#
#   assets/<app>/icon-source.png  ->  assets/<app>/icon.png + assets/<app>/icon.icns
#
# The Raycast extension shares the Git Manager artwork, so its
# extension-icon.png is refreshed from assets/git-manager/icon.png.
#
# Usage:
#   bash scripts/generate-icons.sh                # all apps
#   bash scripts/generate-icons.sh git-manager    # one app
#   bash scripts/generate-icons.sh pr-pulse
#
# To (re)create the placeholder source art first:
#   python3 scripts/generate-placeholder-sources.py
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAYCAST_ICON="$ROOT/raycast-extension/assets/extension-icon.png"

APPS=("$@")
if [[ ${#APPS[@]} -eq 0 ]]; then
  APPS=(git-manager pr-pulse)
fi

generate_for() {
  local app="$1"
  local dir="$ROOT/assets/$app"
  local source="$dir/icon-source.png"

  if [[ ! -f "$source" ]]; then
    echo "Source image not found: $source" >&2
    echo "Run: python3 scripts/generate-placeholder-sources.py" >&2
    echo "or drop a 1024×1024 PNG at that path." >&2
    exit 1
  fi

  sips -z 1024 1024 "$source" --out "$dir/icon.png" >/dev/null

  local iconset="$dir/icon.iconset"
  rm -rf "$iconset"
  mkdir -p "$iconset"
  sips -z 16 16     "$dir/icon.png" --out "$iconset/icon_16x16.png" >/dev/null
  sips -z 32 32     "$dir/icon.png" --out "$iconset/icon_16x16@2x.png" >/dev/null
  sips -z 32 32     "$dir/icon.png" --out "$iconset/icon_32x32.png" >/dev/null
  sips -z 64 64     "$dir/icon.png" --out "$iconset/icon_32x32@2x.png" >/dev/null
  sips -z 128 128   "$dir/icon.png" --out "$iconset/icon_128x128.png" >/dev/null
  sips -z 256 256   "$dir/icon.png" --out "$iconset/icon_128x128@2x.png" >/dev/null
  sips -z 256 256   "$dir/icon.png" --out "$iconset/icon_256x256.png" >/dev/null
  sips -z 512 512   "$dir/icon.png" --out "$iconset/icon_256x256@2x.png" >/dev/null
  sips -z 512 512   "$dir/icon.png" --out "$iconset/icon_512x512.png" >/dev/null
  sips -z 1024 1024 "$dir/icon.png" --out "$iconset/icon_512x512@2x.png" >/dev/null
  iconutil -c icns "$iconset" -o "$dir/icon.icns"
  rm -rf "$iconset"

  echo "Wrote $dir/icon.png"
  echo "Wrote $dir/icon.icns"

  if [[ "$app" == "git-manager" ]]; then
    mkdir -p "$(dirname "$RAYCAST_ICON")"
    sips -z 512 512 "$dir/icon.png" --out "$RAYCAST_ICON" >/dev/null
    echo "Wrote $RAYCAST_ICON"
  fi
}

for app in "${APPS[@]}"; do
  generate_for "$app"
done
