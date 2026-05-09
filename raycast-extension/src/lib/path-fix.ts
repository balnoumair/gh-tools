/**
 * Raycast spawns extension processes with a heavily stripped PATH (in some
 * setups it's empty or omits even `/usr/bin`), which means basic tools like
 * `git` fail with `ENOENT`. Augment PATH at module load with the standard
 * macOS system + user-bin locations.
 *
 * Side-effecty by design: importing this module mutates `process.env.PATH`.
 * Import it once, as the FIRST import in every command entry point.
 */
import os from "node:os";
import path from "node:path";

const EXTRA_PATHS = [
  // System
  "/usr/bin",
  "/bin",
  "/usr/sbin",
  "/sbin",
  // Apple Silicon Homebrew
  "/opt/homebrew/bin",
  "/opt/homebrew/sbin",
  // Intel Homebrew + user-installed binaries
  "/usr/local/bin",
  "/usr/local/sbin",
  // User shell additions
  path.join(os.homedir(), ".local", "bin"),
  path.join(os.homedir(), "bin"),
];

const before = process.env.PATH ?? "";
const seen = new Set(before.split(":").filter(Boolean));
const additions = EXTRA_PATHS.filter((p) => !seen.has(p));

if (additions.length > 0) {
  process.env.PATH = [before, ...additions].filter(Boolean).join(":");
}

// Log once at startup so failures are easy to diagnose from the dev console.
// eslint-disable-next-line no-console
console.log("[path-fix] PATH before:", before);
// eslint-disable-next-line no-console
console.log("[path-fix] PATH after :", process.env.PATH);
