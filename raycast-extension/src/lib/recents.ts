import { LocalStorage } from "@raycast/api";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Repo } from "./types";

const LEGACY_STORAGE_KEY = "recents";
const RECENTS_MAX = 20;

interface RecentsFileV1 {
  version: 1;
  repos: Repo[];
}

function recentsFilePath(): string {
  return path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "gh-viewer",
    "recents.json",
  );
}

function normalizeRepos(repos: Repo[]): Repo[] {
  const seen = new Set<string>();
  const normalized: Repo[] = [];

  for (const repo of repos) {
    if (!repo?.path || typeof repo.name !== "string") continue;
    const resolved = path.resolve(repo.path);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    normalized.push({
      path: resolved,
      name: repo.name || path.basename(resolved),
      openedAt: typeof repo.openedAt === "number" ? repo.openedAt : 0,
    });
  }

  return normalized
    .sort((a, b) => b.openedAt - a.openedAt)
    .slice(0, RECENTS_MAX);
}

async function readFileRecents(): Promise<Repo[]> {
  try {
    const raw = await fs.readFile(recentsFilePath(), "utf8");
    const parsed = JSON.parse(raw) as RecentsFileV1;
    if (parsed?.version !== 1 || !Array.isArray(parsed.repos)) return [];
    return normalizeRepos(parsed.repos);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    return [];
  }
}

async function writeFileRecents(repos: Repo[]): Promise<void> {
  const filePath = recentsFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload: RecentsFileV1 = { version: 1, repos: normalizeRepos(repos) };
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function loadLegacyRaycastRecents(): Promise<Repo[]> {
  const raw = await LocalStorage.getItem<string>(LEGACY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Repo[];
    if (!Array.isArray(parsed)) return [];
    return normalizeRepos(
      parsed.filter(
        (r): r is Repo =>
          r != null &&
          typeof r.path === "string" &&
          typeof r.name === "string" &&
          typeof r.openedAt === "number",
      ),
    );
  } catch {
    return [];
  }
}

async function migrateIfNeeded(fileRecents: Repo[]): Promise<Repo[]> {
  if (fileRecents.length > 0) return fileRecents;

  const legacy = await loadLegacyRaycastRecents();
  if (legacy.length === 0) return [];

  await writeFileRecents(legacy);
  await LocalStorage.removeItem(LEGACY_STORAGE_KEY);
  return legacy;
}

export async function loadRecents(): Promise<Repo[]> {
  const fromFile = await readFileRecents();
  return migrateIfNeeded(fromFile);
}

/**
 * Add (or move-to-front) a repo in the recents list, capped at RECENTS_MAX.
 * Writes to ~/Library/Application Support/gh-viewer/recents.json (shared with the Electron app).
 */
export async function addRecent(repo: Omit<Repo, "openedAt">): Promise<Repo[]> {
  const current = await loadRecents();
  const resolved = path.resolve(repo.path);
  const filtered = current.filter((r) => path.resolve(r.path) !== resolved);
  const updated = normalizeRepos([
    { ...repo, path: resolved, openedAt: Date.now() },
    ...filtered,
  ]);
  await writeFileRecents(updated);
  return updated;
}

export async function removeRecent(repoPath: string): Promise<Repo[]> {
  const resolved = path.resolve(repoPath);
  const updated = (await loadRecents()).filter(
    (r) => path.resolve(r.path) !== resolved,
  );
  await writeFileRecents(updated);
  return updated;
}
