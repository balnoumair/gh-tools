import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getToken } from './auth';
import { showPRNotification } from './notifications';
import type { PullRequest, CIStatus } from '@shared/types';

const execFileAsync = promisify(execFile);

let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastPRIds: Set<number> = new Set();
let cachedPRs: PullRequest[] = [];
let onPRsUpdated: ((prs: PullRequest[]) => void) | null = null;
let pollIntervalMs = 10 * 60 * 1000; // 10 minutes default
let pollingEnabled = true;

export function setPollingEnabled(enabled: boolean): void {
  pollingEnabled = enabled;
  if (!enabled) {
    stopPolling();
  }
}

export function setPollIntervalMs(ms: number): void {
  pollIntervalMs = Math.max(30_000, ms);
  if (pollInterval && pollingEnabled) {
    stopPolling();
    void startPolling();
  }
}

export function setOnPRsUpdated(callback: (prs: PullRequest[]) => void): void {
  onPRsUpdated = callback;
}

export function setPollInterval(minutes: number): void {
  setPollIntervalMs(Math.max(1, Math.min(60, minutes)) * 60 * 1000);
}

export async function startPolling(): Promise<void> {
  if (!pollingEnabled) return;
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

  try {
    const prs = await fetchUserPRs();
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

const PR_QUERY = `
query {
  reviewRequested: search(query: "is:open is:pr review-requested:@me", type: ISSUE, first: 50) {
    nodes { ... on PullRequest { ...prFields } }
  }
  mentioned: search(query: "is:open is:pr mentions:@me", type: ISSUE, first: 30) {
    nodes { ... on PullRequest { ...prFields } }
  }
  assigned: search(query: "is:open is:pr assignee:@me", type: ISSUE, first: 30) {
    nodes { ... on PullRequest { ...prFields } }
  }
  authored: search(query: "is:open is:pr author:@me", type: ISSUE, first: 50) {
    nodes { ... on PullRequest { ...prFields } }
  }
}

fragment prFields on PullRequest {
  databaseId
  number
  title
  url
  updatedAt
  author { login avatarUrl }
  repository { nameWithOwner }
  commits(last: 1) {
    nodes {
      commit {
        statusCheckRollup { state }
      }
    }
  }
}
`.trim();

interface GqlPR {
  databaseId: number;
  number: number;
  title: string;
  url: string;
  updatedAt: string;
  author: { login: string; avatarUrl?: string } | null;
  repository: { nameWithOwner: string };
  commits: {
    nodes: Array<{
      commit: { statusCheckRollup: { state: string } | null };
    }>;
  };
}

interface GqlResponse {
  data?: {
    reviewRequested: { nodes: GqlPR[] };
    mentioned: { nodes: GqlPR[] };
    assigned: { nodes: GqlPR[] };
    authored: { nodes: GqlPR[] };
  };
  errors?: Array<{ message: string }>;
}

function mapCiStatus(state: string | null | undefined): CIStatus {
  switch (state) {
    case 'SUCCESS':
      return 'success';
    case 'FAILURE':
    case 'ERROR':
      return 'failure';
    case 'PENDING':
    case 'EXPECTED':
      return 'pending';
    default:
      return 'unknown';
  }
}

function toPullRequest(node: GqlPR, mentionType: PullRequest['mentionType']): PullRequest {
  const rollupState = node.commits.nodes[0]?.commit.statusCheckRollup?.state;
  return {
    id: node.databaseId,
    number: node.number,
    title: node.title,
    url: node.url,
    repoFullName: node.repository.nameWithOwner,
    author: {
      login: node.author?.login ?? 'unknown',
      avatarUrl: node.author?.avatarUrl ?? '',
    },
    ciStatus: mapCiStatus(rollupState),
    updatedAt: node.updatedAt,
    mentionType,
  };
}

async function fetchUserPRs(): Promise<PullRequest[]> {
  const { stdout } = await execFileAsync(
    'gh',
    ['api', 'graphql', '-f', `query=${PR_QUERY}`],
    { maxBuffer: 10 * 1024 * 1024, timeout: 30_000 }
  );

  const parsed = JSON.parse(stdout) as GqlResponse;
  if (parsed.errors?.length) {
    throw new Error(`gh graphql errors: ${parsed.errors.map((e) => e.message).join('; ')}`);
  }
  if (!parsed.data) throw new Error('gh graphql returned no data');

  const prMap = new Map<number, PullRequest>();
  const ingest = (nodes: GqlPR[], mentionType: PullRequest['mentionType']) => {
    for (const node of nodes) {
      if (!node || prMap.has(node.databaseId)) continue;
      prMap.set(node.databaseId, toPullRequest(node, mentionType));
    }
  };

  ingest(parsed.data.reviewRequested.nodes, 'review_requested');
  ingest(parsed.data.mentioned.nodes, 'mentioned');
  ingest(parsed.data.assigned.nodes, 'assigned');
  ingest(parsed.data.authored.nodes, 'authored');

  return Array.from(prMap.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
