#!/usr/bin/env bash
# Run gh-viewer (Electron) and the Raycast extension together.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  if [[ -n "${RAYCAST_PID:-}" ]]; then
    kill "$RAYCAST_PID" 2>/dev/null || true
  fi
  if [[ -n "${ELECTRON_PID:-}" ]]; then
    kill "$ELECTRON_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting gh-viewer (Electron)..."
(cd "$ROOT" && pnpm run dev:app) &
ELECTRON_PID=$!

echo "Starting Git Manager (Raycast)..."
(cd "$ROOT" && pnpm run dev:extension) &
RAYCAST_PID=$!

echo ""
echo "Both running — menubar app + Raycast extension."
echo "Press Ctrl+C to stop both."
wait "$ELECTRON_PID" "$RAYCAST_PID"
