#!/usr/bin/env bash
# Regenerate assets/icon.png, assets/icon.icns, and raycast-extension/assets/extension-icon.png
# Usage: bash scripts/generate-icons.sh [source.png]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${1:-$ROOT/assets/icon-source.png}"

if [[ ! -f "$SOURCE" ]]; then
  echo "Source image not found: $SOURCE" >&2
  echo "Pass a 1024×1024 PNG or place icon-source.png in assets/." >&2
  exit 1
fi

ASSETS="$ROOT/assets"
RAYCAST_ICON="$ROOT/raycast-extension/assets/extension-icon.png"
ICONSET="$ASSETS/icon.iconset"

mkdir -p "$ASSETS" "$(dirname "$RAYCAST_ICON")"
sips -z 1024 1024 "$SOURCE" --out "$ASSETS/icon.png" >/dev/null

rm -rf "$ICONSET"
mkdir -p "$ICONSET"
sips -z 16 16     "$ASSETS/icon.png" --out "$ICONSET/icon_16x16.png" >/dev/null
sips -z 32 32     "$ASSETS/icon.png" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
sips -z 32 32     "$ASSETS/icon.png" --out "$ICONSET/icon_32x32.png" >/dev/null
sips -z 64 64     "$ASSETS/icon.png" --out "$ICONSET/icon_32x32@2x.png" >/dev/null
sips -z 128 128   "$ASSETS/icon.png" --out "$ICONSET/icon_128x128.png" >/dev/null
sips -z 256 256   "$ASSETS/icon.png" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
sips -z 256 256   "$ASSETS/icon.png" --out "$ICONSET/icon_256x256.png" >/dev/null
sips -z 512 512   "$ASSETS/icon.png" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
sips -z 512 512   "$ASSETS/icon.png" --out "$ICONSET/icon_512x512.png" >/dev/null
sips -z 1024 1024 "$ASSETS/icon.png" --out "$ICONSET/icon_512x512@2x.png" >/dev/null
iconutil -c icns "$ICONSET" -o "$ASSETS/icon.icns"
rm -rf "$ICONSET"

sips -z 512 512 "$ASSETS/icon.png" --out "$RAYCAST_ICON" >/dev/null

echo "Wrote $ASSETS/icon.png"
echo "Wrote $ASSETS/icon.icns"
echo "Wrote $RAYCAST_ICON"
