import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  RECENTS_APP_SUPPORT_DIR,
  RECENTS_FILE_NAME,
  RECENTS_MAX,
  type RecentsFileV1,
  type SharedRecentRepo,
} from '@shared/recents';

function recentsFilePath(): string {
  return path.join(
    os.homedir(),
    'Library',
    'Application Support',
    RECENTS_APP_SUPPORT_DIR,
    RECENTS_FILE_NAME,
  );
}

function normalizeRepos(repos: SharedRecentRepo[]): SharedRecentRepo[] {
  const seen = new Set<string>();
  const normalized: SharedRecentRepo[] = [];

  for (const repo of repos) {
    if (!repo?.path) continue;
    const resolved = path.resolve(repo.path);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    normalized.push({
      path: resolved,
      name: repo.name || path.basename(resolved),
      openedAt: typeof repo.openedAt === 'number' ? repo.openedAt : 0,
    });
  }

  return normalized
    .sort((a, b) => b.openedAt - a.openedAt)
    .slice(0, RECENTS_MAX);
}

export async function loadSharedRecents(): Promise<SharedRecentRepo[]> {
  try {
    const raw = await fs.readFile(recentsFilePath(), 'utf8');
    const parsed = JSON.parse(raw) as RecentsFileV1;
    if (parsed?.version !== 1 || !Array.isArray(parsed.repos)) return [];
    return normalizeRepos(parsed.repos);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    return [];
  }
}

async function saveSharedRecents(repos: SharedRecentRepo[]): Promise<void> {
  const filePath = recentsFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload: RecentsFileV1 = {
    version: 1,
    repos: normalizeRepos(repos),
  };
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

export async function touchSharedRecent(repo: {
  path: string;
  name: string;
}): Promise<SharedRecentRepo[]> {
  const resolved = path.resolve(repo.path);
  const current = await loadSharedRecents();
  const filtered = current.filter((entry) => path.resolve(entry.path) !== resolved);
  const updated = normalizeRepos([
    { path: resolved, name: repo.name, openedAt: Date.now() },
    ...filtered,
  ]);
  await saveSharedRecents(updated);
  return updated;
}

export async function removeSharedRecent(repoPath: string): Promise<SharedRecentRepo[]> {
  const resolved = path.resolve(repoPath);
  const updated = (await loadSharedRecents()).filter(
    (entry) => path.resolve(entry.path) !== resolved,
  );
  await saveSharedRecents(updated);
  return updated;
}

/** Merge legacy recents into the shared file when the file is still empty. */
export async function migrateLegacyRecents(
  legacy: Array<{ path: string; name: string; openedAt?: number }>,
): Promise<SharedRecentRepo[]> {
  const existing = await loadSharedRecents();
  if (existing.length > 0 || legacy.length === 0) return existing;

  const merged = normalizeRepos(
    legacy.map((repo) => ({
      path: repo.path,
      name: repo.name,
      openedAt: repo.openedAt ?? Date.now(),
    })),
  );
  await saveSharedRecents(merged);
  return merged;
}

export function getSharedRecentsPathForDebug(): string {
  return recentsFilePath();
}
