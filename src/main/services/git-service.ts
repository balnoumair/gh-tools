import simpleGit, { type SimpleGit } from 'simple-git';
import { dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import type {
  GitRepo,
  GitRepoStatus,
  GitBranch,
  GitStashEntry,
  GitWorktree,
  GitOperationResult,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
  WorktreeCreateOptions,
  WorktreeRemoveOptions,
  WorktreeCommitOptions,
} from '@shared/types';

function getGit(repoPath: string): SimpleGit {
  return simpleGit({ baseDir: repoPath, binary: 'git', maxConcurrentProcesses: 1 });
}

function result(
  start: number,
  success: boolean,
  message: string,
  output = '',
): GitOperationResult {
  return { success, message, output, duration: Date.now() - start };
}

function normalizePath(value: string): string {
  return path.resolve(value);
}

function isPrimaryWorktree(worktreePath: string, repoPath: string): boolean {
  if (normalizePath(worktreePath) === normalizePath(repoPath)) return true;

  try {
    return fs.statSync(path.join(worktreePath, '.git')).isDirectory();
  } catch {
    return false;
  }
}

function parseWorktreeList(output: string, repoPath: string): GitWorktree[] {
  const records = output
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return records.map((record) => {
    const lines = record.split('\n');
    const pathLine = lines.find((line) => line.startsWith('worktree '));
    const branchLine = lines.find((line) => line.startsWith('branch '));
    const headLine = lines.find((line) => line.startsWith('HEAD '));
    const worktreePath = pathLine?.replace(/^worktree /, '') ?? repoPath;
    const head = headLine?.replace(/^HEAD /, '').slice(0, 8) ?? 'unknown';
    const branch = branchLine
      ? branchLine.replace(/^branch refs\/heads\//, '').replace(/^branch /, '')
      : `(detached) ${head}`;

    return {
      path: worktreePath,
      branch,
      primary: isPrimaryWorktree(worktreePath, repoPath),
      dirty: false,
      ahead: 0,
      behind: 0,
    };
  });
}

async function getAheadBehind(worktreePath: string, branch: string): Promise<{ ahead: number; behind: number }> {
  if (branch.startsWith('(detached) ')) return { ahead: 0, behind: 0 };

  const git = getGit(worktreePath);

  try {
    const upstream = (await git.raw([
      'rev-parse',
      '--abbrev-ref',
      '--symbolic-full-name',
      '@{u}',
    ])).trim();

    if (!upstream) return { ahead: 0, behind: 0 };

    const counts = (await git.raw([
      'rev-list',
      '--left-right',
      '--count',
      `${branch}...${upstream}`,
    ])).trim();
    const [aheadRaw, behindRaw] = counts.split(/\s+/);

    return {
      ahead: Number.parseInt(aheadRaw ?? '0', 10) || 0,
      behind: Number.parseInt(behindRaw ?? '0', 10) || 0,
    };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}

// --- Repo selection ---

export async function selectRepo(): Promise<GitRepo | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Open Git Repository',
    properties: ['openDirectory'],
    message: 'Select a folder containing a git repository',
  });

  if (canceled || filePaths.length === 0) return null;

  const selected = filePaths[0];
  const gitDir = path.join(selected, '.git');

  if (!fs.existsSync(gitDir)) {
    const git = getGit(selected);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) return null;
  }

  return { path: selected, name: path.basename(selected) };
}

// --- Status ---

export async function getRepoStatus(repoPath: string): Promise<GitRepoStatus> {
  const git = getGit(repoPath);

  const [branchSummary, status, stashList, worktrees] = await Promise.all([
    git.branch(['-a', '-v', '--no-abbrev']),
    git.status(),
    git.stashList(),
    listWorktrees(repoPath),
  ]);

  const branches: GitBranch[] = [];

  for (const [name, data] of Object.entries(branchSummary.branches)) {
    if (name === 'HEAD' || name.includes('HEAD detached')) continue;

    const isRemote = name.startsWith('remotes/');
    const cleanName = isRemote ? name.replace(/^remotes\//, '') : name;
    const remoteName = isRemote ? cleanName.split('/')[0] : null;

    branches.push({
      name: cleanName,
      current: data.current,
      tracking: isRemote ? null : (status.tracking || null),
      isRemote,
      remoteName,
      commitHash: data.commit.substring(0, 8),
      ahead: data.current ? status.ahead : 0,
      behind: data.current ? status.behind : 0,
    });
  }

  const stashes: GitStashEntry[] = stashList.all.map((entry, index) => ({
    index,
    message: entry.message,
    date: entry.date,
    branch: entry.body || '',
  }));

  return {
    currentBranch: branchSummary.current,
    branches,
    stashes,
    worktrees,
    hasUncommittedChanges: !status.isClean(),
    untrackedCount: status.not_added.length,
    stagedCount: status.staged.length,
    modifiedCount: status.modified.length,
    conflictCount: status.conflicted.length,
  };
}

// --- Worktrees ---

export async function listWorktrees(repoPath: string): Promise<GitWorktree[]> {
  const git = getGit(repoPath);
  const output = await git.raw(['worktree', 'list', '--porcelain']);
  const worktrees = parseWorktreeList(output, repoPath);

  return Promise.all(
    worktrees.map(async (worktree) => {
      const worktreeGit = getGit(worktree.path);
      const [statusOutput, counts] = await Promise.all([
        worktreeGit.raw(['status', '--porcelain']).catch(() => ''),
        getAheadBehind(worktree.path, worktree.branch),
      ]);

      return {
        ...worktree,
        dirty: statusOutput.trim().length > 0,
        ahead: counts.ahead,
        behind: counts.behind,
      };
    }),
  );
}

export async function createWorktree(opts: WorktreeCreateOptions): Promise<GitOperationResult> {
  const start = Date.now();
  const targetPath = normalizePath(opts.targetPath);

  try {
    if (fs.existsSync(targetPath)) {
      return result(start, false, `Worktree target already exists: ${targetPath}`);
    }

    const git = getGit(opts.repoPath);
    const output = await git.raw(['worktree', 'add', targetPath, opts.branch]);
    return result(start, true, `Created worktree at ${targetPath}`, output);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Create worktree failed: ${msg}`, msg);
  }
}

export async function removeWorktree(opts: WorktreeRemoveOptions): Promise<GitOperationResult> {
  const start = Date.now();
  const worktreePath = normalizePath(opts.worktreePath);

  try {
    const worktrees = await listWorktrees(opts.repoPath);
    const target = worktrees.find((worktree) => normalizePath(worktree.path) === worktreePath);

    if (target?.primary || normalizePath(opts.repoPath) === worktreePath) {
      return result(start, false, 'The primary worktree cannot be removed');
    }

    const args = ['worktree', 'remove'];
    if (opts.force) args.push('--force');
    args.push(worktreePath);

    const git = getGit(opts.repoPath);
    const output = await git.raw(args);
    return result(start, true, `Removed worktree at ${worktreePath}`, output);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Remove worktree failed: ${msg}`, msg);
  }
}

export async function commitWorktree(opts: WorktreeCommitOptions): Promise<GitOperationResult> {
  const start = Date.now();

  try {
    const git = getGit(opts.worktreePath);
    await git.add(['-A']);
    const commit = await git.commit(opts.message);
    let output = JSON.stringify(commit.summary, null, 2);

    if (opts.alsoPush) {
      const pushResult = await git.push();
      output = `${output}\n${JSON.stringify(pushResult, null, 2)}`;
    }

    return result(
      start,
      true,
      opts.alsoPush ? 'Committed and pushed worktree changes' : 'Committed worktree changes',
      output,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Commit failed: ${msg}`, msg);
  }
}

// --- Branch operations ---

export async function checkoutBranch(
  repoPath: string,
  branch: string,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(repoPath);
    const isRemoteRef = branch.includes('/');
    if (isRemoteRef) {
      const localName = branch.split('/').slice(1).join('/');
      await git.checkout(['-b', localName, '--track', `remotes/${branch}`]);
      return result(start, true, `Checked out new branch '${localName}' tracking '${branch}'`);
    }
    await git.checkout(branch);
    return result(start, true, `Switched to branch '${branch}'`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Checkout failed: ${msg}`, msg);
  }
}

export async function createBranch(
  repoPath: string,
  name: string,
  startPoint?: string,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(repoPath);
    await git.checkoutLocalBranch(name);
    if (startPoint) {
      await git.reset(['--hard', startPoint]);
    }
    return result(start, true, `Created and switched to branch '${name}'`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Create branch failed: ${msg}`, msg);
  }
}

export async function deleteBranch(
  repoPath: string,
  branch: string,
  force = false,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(repoPath);
    const flag = force ? '-D' : '-d';
    await git.branch([flag, branch]);
    return result(start, true, `Deleted branch '${branch}'`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Delete branch failed: ${msg}`, msg);
  }
}

// --- Merge ---

export async function merge(opts: MergeOptions): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(opts.repoPath);
    const status = await git.status();
    const originalBranch = status.current;

    if (originalBranch !== opts.targetBranch) {
      await git.checkout(opts.targetBranch);
    }

    const mergeArgs = opts.noFastForward
      ? ['--no-ff', opts.sourceBranch]
      : [opts.sourceBranch];

    const mergeResult = await git.merge(mergeArgs);
    const output = mergeResult?.result ?? 'Merge completed';

    return result(
      start,
      true,
      `Merged '${opts.sourceBranch}' into '${opts.targetBranch}'`,
      String(output),
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConflict = msg.toLowerCase().includes('conflict');
    return result(
      start,
      false,
      isConflict
        ? `Merge conflicts detected — resolve them manually`
        : `Merge failed: ${msg}`,
      msg,
    );
  }
}

// --- Push ---

export async function push(opts: PushOptions): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(opts.repoPath);
    const remote = opts.remote ?? 'origin';
    const args: string[] = [remote];

    if (opts.branch) args.push(opts.branch);
    if (opts.setUpstream) args.unshift('--set-upstream');
    if (opts.skipPrePushHooks) args.unshift('--no-verify');

    const pushResult = await git.push(args);
    const pushed = pushResult?.pushed ?? [];
    const summary =
      pushed.length > 0
        ? pushed.map((p) => `${p.local} → ${p.remote}`).join(', ')
        : 'Push completed';

    return result(start, true, summary, JSON.stringify(pushResult, null, 2));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Push failed: ${msg}`, msg);
  }
}

// --- Fetch ---

export async function fetch(
  repoPath: string,
  remote?: string,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(repoPath);
    const fetchResult = await git.fetch(remote ?? 'origin', { '--prune': null });
    return result(
      start,
      true,
      'Fetch completed',
      JSON.stringify(fetchResult, null, 2),
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Fetch failed: ${msg}`, msg);
  }
}

// --- Pull ---

export async function pull(opts: UpdateOptions): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(opts.repoPath);
    const remote = opts.remote ?? 'origin';

    if (opts.strategy === 'rebase') {
      const args = ['--rebase', remote];
      if (opts.branch) args.push(opts.branch);
      await git.pull(args);
    } else {
      await git.pull(remote, opts.branch);
    }

    return result(start, true, `Pull (${opts.strategy}) completed`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Pull failed: ${msg}`, msg);
  }
}

// --- Stash ---

export async function stashCreate(
  opts: StashCreateOptions,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(opts.repoPath);
    const args: string[] = ['push'];
    if (opts.message) args.push('-m', opts.message);
    if (opts.includeUntracked) args.push('--include-untracked');

    await git.stash(args);
    return result(start, true, opts.message ? `Stashed: ${opts.message}` : 'Changes stashed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Stash failed: ${msg}`, msg);
  }
}

export async function stashApply(
  opts: StashApplyOptions,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(opts.repoPath);
    const action = opts.drop ? 'pop' : 'apply';
    await git.stash([action, `stash@{${opts.stashIndex}}`]);
    return result(
      start,
      true,
      `Stash @{${opts.stashIndex}} ${opts.drop ? 'popped' : 'applied'}`,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Stash ${opts.drop ? 'pop' : 'apply'} failed: ${msg}`, msg);
  }
}

export async function stashDrop(
  repoPath: string,
  stashIndex: number,
): Promise<GitOperationResult> {
  const start = Date.now();
  try {
    const git = getGit(repoPath);
    await git.stash(['drop', `stash@{${stashIndex}}`]);
    return result(start, true, `Dropped stash @{${stashIndex}}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return result(start, false, `Stash drop failed: ${msg}`, msg);
  }
}
