export type PRStatus = 'open' | 'draft' | 'approved' | 'changes_requested' | 'merged' | 'closed';

export type CIStatus = 'pending' | 'success' | 'failure' | 'neutral' | 'unknown';

export type ReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  url: string;
  repoFullName: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  isDraft: boolean;
  reviewDecision: ReviewDecision;
  ciStatus: CIStatus;
  createdAt: string;
  updatedAt: string;
  labels: Array<{ name: string; color: string }>;
  additions: number;
  deletions: number;
  mentionType: 'review_requested' | 'mentioned' | 'assigned';
}

export interface AuthStatus {
  authenticated: boolean;
  username: string | null;
  source: 'gh-cli' | 'manual' | null;
}

export interface Settings {
  pollIntervalMinutes: number;
  manualToken: string | null;
}

export interface AppState {
  prs: PullRequest[];
  authStatus: AuthStatus;
  lastRefreshed: string | null;
  isRefreshing: boolean;
  error: string | null;
}
