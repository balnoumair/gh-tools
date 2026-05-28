#!/usr/bin/env bash
# Run the Git Manager Electron app and the Raycast extension together.
# (PR Pulse, the menubar app, is a separate build — run it with `pnpm dev:pulse`.
#  Two electron-forge starts can't share one project's .vite output at once.)
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

echo "Starting Git Manager (Electron)..."
(cd "$ROOT" && pnpm run dev:manager) &
ELECTRON_PID=$!

echo "Starting Git Manager (Raycast)..."
(cd "$ROOT" && pnpm run dev:extension) &
RAYCAST_PID=$!

echo ""
echo "Both running — Git Manager app + Raycast extension."
echo "Press Ctrl+C to stop both."
wait "$ELECTRON_PID" "$RAYCAST_PID"
