export interface Repo {
  /** Absolute path to the repository (typically the primary worktree). */
  path: string;
  /** Display name (basename of the path). */
  name: string;
  /** Last time this repo was opened, ms since epoch. */
  openedAt: number;
}

export interface Worktree {
  /** Absolute path to the worktree directory. */
  path: string;
  /** Branch name checked out in this worktree, or null if detached. */
  branch: string | null;
  /** Short SHA of HEAD. */
  head: string;
  /** True if this is the primary worktree (main checkout). */
  isPrimary: boolean;
  /** Working-copy is dirty (uncommitted changes). */
  dirty: boolean;
  /** Commits ahead of upstream. null if no upstream tracking. */
  ahead: number | null;
  /** Commits behind upstream. null if no upstream tracking. */
  behind: number | null;
}

export interface Branch {
  /** Branch name (e.g. "feat/foo"). */
  name: string;
  /** Short SHA of the branch tip. */
  head: string;
  /** Commits ahead of upstream. null if no upstream tracking. */
  ahead: number | null;
  /** Commits behind upstream. null if no upstream tracking. */
  behind: number | null;
  /** True if this branch is checked out by some worktree. */
  hasWorktree: boolean;
}

export type EditorTarget =
  | "cursor"
  | "claude"
  | "codex"
  | "zed"
  | "terminal"
  | "finder";
