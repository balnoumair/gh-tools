#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAYCAST="$ROOT/raycast-extension"

if [[ ! -d "$RAYCAST/node_modules" ]]; then
  echo "Installing Raycast extension dependencies..."
  (cd "$RAYCAST" && npm install)
fi

cd "$RAYCAST"
exec npm run dev
