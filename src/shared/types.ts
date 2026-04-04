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
  mentionType: 'review_requested' | 'mentioned' | 'assigned' | 'authored';
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

// --- Git Management Types ---

export interface GitRepo {
  path: string;
  name: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
  tracking: string | null;
  isRemote: boolean;
  remoteName: string | null;
  commitHash: string;
  ahead: number;
  behind: number;
}

export interface GitStashEntry {
  index: number;
  message: string;
  date: string;
  branch: string;
}

export interface GitRepoStatus {
  currentBranch: string;
  branches: GitBranch[];
  stashes: GitStashEntry[];
  hasUncommittedChanges: boolean;
  untrackedCount: number;
  stagedCount: number;
  modifiedCount: number;
  conflictCount: number;
}

export interface GitOperationResult {
  success: boolean;
  message: string;
  output: string;
  duration: number;
}

export interface MergeOptions {
  repoPath: string;
  sourceBranch: string;
  targetBranch: string;
  noFastForward?: boolean;
}

export interface PushOptions {
  repoPath: string;
  branch?: string;
  remote?: string;
  skipPrePushHooks?: boolean;
  setUpstream?: boolean;
}

export interface UpdateOptions {
  repoPath: string;
  remote?: string;
  strategy: 'merge' | 'rebase';
  branch?: string;
}

export interface StashCreateOptions {
  repoPath: string;
  message?: string;
  includeUntracked?: boolean;
}

export interface StashApplyOptions {
  repoPath: string;
  stashIndex: number;
  drop?: boolean;
}
