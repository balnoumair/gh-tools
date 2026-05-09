import { execa } from "execa";
import path from "node:path";
import type { Branch, Worktree } from "./types";

/**
 * Thin wrapper around `git` invocations. All commands shell out to the system
 * `git` binary; we never bundle a JS git implementation.
 */
async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execa("git", args, { cwd });
  return stdout;
}

/** Run a git command and return both stdout/stderr; throws on non-zero exit. */
async function gitVerbose(
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execa("git", args, { cwd });
  return { stdout, stderr };
}

/**
 * Parse `git worktree list --porcelain` output into a structured list.
 * The porcelain format emits records separated by blank lines, with lines like:
 *   worktree /abs/path
 *   HEAD <sha>
 *   branch refs/heads/<name>      (or 'detached')
 */
export async function listWorktrees(repoPath: string): Promise<Worktree[]> {
  const raw = await git(["worktree", "list", "--porcelain"], repoPath);
  const records = raw.split(/\n\n+/).filter((r) => r.trim().length > 0);

  const worktrees: Worktree[] = [];
  for (let i = 0; i < records.length; i++) {
    const lines = records[i].split("\n");
    let wtPath = "";
    let head = "";
    let branch: string | null = null;

    for (const line of lines) {
      if (line.startsWith("worktree ")) wtPath = line.slice("worktree ".length);
      else if (line.startsWith("HEAD "))
        head = line.slice("HEAD ".length).slice(0, 8);
      else if (line.startsWith("branch ")) {
        const ref = line.slice("branch ".length);
        branch = ref.startsWith("refs/heads/")
          ? ref.slice("refs/heads/".length)
          : ref;
      } else if (line === "detached") {
        branch = null;
      }
    }

    if (!wtPath) continue;

    // Per-worktree status: dirty + ahead/behind
    const [dirty, aheadBehind] = await Promise.all([
      isDirty(wtPath).catch(() => false),
      getAheadBehind(wtPath).catch(() => ({ ahead: null, behind: null })),
    ]);

    worktrees.push({
      path: wtPath,
      branch,
      head,
      isPrimary: i === 0, // git lists the main worktree first
      dirty,
      ahead: aheadBehind.ahead,
      behind: aheadBehind.behind,
    });
  }

  return worktrees;
}

async function isDirty(wtPath: string): Promise<boolean> {
  const out = await git(["status", "--porcelain"], wtPath);
  return out.trim().length > 0;
}

async function getAheadBehind(
  wtPath: string,
): Promise<{ ahead: number | null; behind: number | null }> {
  try {
    const out = await git(
      ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"],
      wtPath,
    );
    const parts = out.trim().split(/\s+/);
    if (parts.length === 2) {
      return { ahead: parseInt(parts[0], 10), behind: parseInt(parts[1], 10) };
    }
  } catch {
    // No upstream tracking, fall through
  }
  return { ahead: null, behind: null };
}

/**
 * List local branches plus whether they're checked out by a worktree.
 * Used to populate the "Branches" section in the workspace view (typically
 * filtered to those without a worktree).
 */
export async function listBranches(repoPath: string): Promise<Branch[]> {
  const out = await git(
    [
      "for-each-ref",
      "--format=%(refname:short)%09%(objectname:short)",
      "refs/heads/",
    ],
    repoPath,
  );
  const branchRows = out
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, head] = line.split("\t");
      return { name, head };
    });

  const worktrees = await listWorktrees(repoPath);
  const branchesWithWorktree = new Set(
    worktrees.map((w) => w.branch).filter(Boolean) as string[],
  );

  // Ahead/behind requires per-branch checkout context; cheap path: skip and let UI
  // render "—" for branches without a worktree. Worktree rows already carry it.
  return branchRows.map((b) => ({
    name: b.name,
    head: b.head,
    ahead: null,
    behind: null,
    hasWorktree: branchesWithWorktree.has(b.name),
  }));
}

/** Returns null if the path is not inside a git working tree. */
export async function detectRepo(
  candidatePath: string,
): Promise<{ path: string; name: string } | null> {
  try {
    const out = await git(["rev-parse", "--show-toplevel"], candidatePath);
    const top = out.trim();
    return { path: top, name: path.basename(top) };
  } catch {
    return null;
  }
}

export async function commitInWorktree(
  wtPath: string,
  message: string,
): Promise<void> {
  await gitVerbose(["add", "-A"], wtPath);
  await gitVerbose(["commit", "-m", message], wtPath);
}

export async function pushWorktree(wtPath: string): Promise<void> {
  await gitVerbose(["push"], wtPath);
}

export async function pullWorktree(wtPath: string): Promise<void> {
  await gitVerbose(["pull", "--ff-only"], wtPath);
}

/** Merge `main` (or whatever the default branch is) into the worktree's branch. */
export async function mergeMainInto(wtPath: string): Promise<void> {
  // Detect the default branch from origin/HEAD; fall back to "main" then "master".
  let defaultBranch = "main";
  try {
    const out = await git(["symbolic-ref", "refs/remotes/origin/HEAD"], wtPath);
    const ref = out.trim();
    const slash = ref.lastIndexOf("/");
    if (slash >= 0) defaultBranch = ref.slice(slash + 1);
  } catch {
    // Try master if main doesn't exist
    try {
      await git(["rev-parse", "--verify", "main"], wtPath);
    } catch {
      defaultBranch = "master";
    }
  }
  await gitVerbose(["merge", defaultBranch], wtPath);
}

export async function removeWorktree(
  repoPath: string,
  wtPath: string,
  force = false,
): Promise<void> {
  const args = ["worktree", "remove"];
  if (force) args.push("--force");
  args.push(wtPath);
  await gitVerbose(args, repoPath);
}

/**
 * Create a worktree at `targetPath` checked out to `branch`.
 * If the branch does not exist, it is created from the current HEAD.
 */
export async function createWorktree(
  repoPath: string,
  branch: string,
  targetPath: string,
): Promise<void> {
  // Check if branch exists locally
  let branchExists = true;
  try {
    await git(["rev-parse", "--verify", `refs/heads/${branch}`], repoPath);
  } catch {
    branchExists = false;
  }

  const args = ["worktree", "add"];
  if (!branchExists) args.push("-b", branch);
  args.push(targetPath);
  if (branchExists) args.push(branch);
  await gitVerbose(args, repoPath);
}

/** Checkout `branch` in the primary worktree (i.e. `repoPath` itself). */
export async function checkoutInPrimary(
  repoPath: string,
  branch: string,
): Promise<void> {
  await gitVerbose(["checkout", branch], repoPath);
}
