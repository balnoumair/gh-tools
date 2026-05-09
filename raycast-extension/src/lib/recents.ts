import { LocalStorage } from "@raycast/api";
import type { Repo } from "./types";

const STORAGE_KEY = "recents";
const MAX_RECENTS = 20;

export async function loadRecents(): Promise<Repo[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Repo[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is Repo =>
        r != null &&
        typeof r.path === "string" &&
        typeof r.name === "string" &&
        typeof r.openedAt === "number",
    );
  } catch {
    return [];
  }
}

/**
 * Add (or move-to-front) a repo in the recents list, capped at MAX_RECENTS.
 * Matches existing entries by absolute path.
 */
export async function addRecent(repo: Omit<Repo, "openedAt">): Promise<Repo[]> {
  const current = await loadRecents();
  const filtered = current.filter((r) => r.path !== repo.path);
  const updated: Repo[] = [
    { ...repo, openedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX_RECENTS);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeRecent(repoPath: string): Promise<Repo[]> {
  const current = await loadRecents();
  const updated = current.filter((r) => r.path !== repoPath);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
