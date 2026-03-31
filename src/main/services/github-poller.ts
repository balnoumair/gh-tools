import { Octokit } from '@octokit/rest';
import { getToken } from './auth';
import { showPRNotification } from './notifications';
import type { PullRequest, CIStatus, ReviewDecision } from '@shared/types';

let octokit: Octokit | null = null;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastPRIds: Set<number> = new Set();
let cachedPRs: PullRequest[] = [];
let onPRsUpdated: ((prs: PullRequest[]) => void) | null = null;
let pollIntervalMs = 10 * 60 * 1000; // 10 minutes default
let etag: string | null = null;

export function setOnPRsUpdated(callback: (prs: PullRequest[]) => void): void {
  onPRsUpdated = callback;
}

export function setPollInterval(minutes: number): void {
  const clamped = Math.max(1, Math.min(60, minutes));
  pollIntervalMs = clamped * 60 * 1000;
  if (pollInterval) {
    stopPolling();
    startPolling();
  }
}

export async function startPolling(): Promise<void> {
  await refreshPRs();
  pollInterval = setInterval(() => refreshPRs(), pollIntervalMs);
}

export function stopPolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export async function refreshPRs(): Promise<PullRequest[]> {
  const token = await getToken();
  if (!token) return [];

  if (!octokit) {
    octokit = new Octokit({ auth: token });
  }

  try {
    const prs = await fetchUserPRs(octokit);
    const newPRIds = new Set(prs.map((pr) => pr.id));

    // Detect new PRs for notifications
    if (lastPRIds.size > 0) {
      for (const pr of prs) {
        if (!lastPRIds.has(pr.id)) {
          showPRNotification(pr);
        }
      }
    }

    lastPRIds = newPRIds;
    cachedPRs = prs;
    onPRsUpdated?.(prs);
    return prs;
  } catch (error) {
    console.error('[gh-poller] Failed to fetch PRs:', error);
    return cachedPRs;
  }
}

export function getCachedPRs(): PullRequest[] {
  return cachedPRs;
}

async function fetchUserPRs(kit: Octokit): Promise<PullRequest[]> {
  // Fetch PRs where user is requested reviewer
  const reviewRequested = await kit.rest.search.issuesAndPullRequests({
    q: 'is:open is:pr review-requested:@me',
    sort: 'updated',
    order: 'desc',
    per_page: 50,
    ...(etag ? { headers: { 'If-None-Match': etag } } : {}),
  });

  if (reviewRequested.headers.etag) {
    etag = reviewRequested.headers.etag;
  }

  // Fetch PRs where user is mentioned
  const mentioned = await kit.rest.search.issuesAndPullRequests({
    q: 'is:open is:pr mentions:@me',
    sort: 'updated',
    order: 'desc',
    per_page: 30,
  });

  // Fetch PRs where user is assigned
  const assigned = await kit.rest.search.issuesAndPullRequests({
    q: 'is:open is:pr assignee:@me',
    sort: 'updated',
    order: 'desc',
    per_page: 30,
  });

  // Deduplicate and merge
  const prMap = new Map<number, PullRequest>();

  const mapItems = (
    items: typeof reviewRequested.data.items,
    mentionType: PullRequest['mentionType']
  ) => {
    for (const item of items) {
      if (prMap.has(item.id)) continue;

      const repoUrl = item.repository_url || '';
      const repoFullName = repoUrl.replace('https://api.github.com/repos/', '');

      prMap.set(item.id, {
        id: item.id,
        number: item.number,
        title: item.title,
        url: item.html_url || item.url,
        repoFullName,
        author: {
          login: item.user?.login || 'unknown',
          avatarUrl: item.user?.avatar_url || '',
        },
        isDraft: (item as any).draft || false,
        reviewDecision: null, // Search API doesn't return this
        ciStatus: 'unknown' as CIStatus,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        labels: (item.labels || [])
          .filter((l): l is { name: string; color: string } =>
            typeof l === 'object' && l !== null && 'name' in l
          )
          .map((l) => ({ name: l.name, color: l.color || '888888' })),
        additions: 0,
        deletions: 0,
        mentionType,
      });
    }
  };

  mapItems(reviewRequested.data.items, 'review_requested');
  mapItems(mentioned.data.items, 'mentioned');
  mapItems(assigned.data.items, 'assigned');

  return Array.from(prMap.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function resetOctokit(): void {
  octokit = null;
  etag = null;
}
