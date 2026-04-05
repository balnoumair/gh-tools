import simpleGit, { type SimpleGit } from 'simple-git';
import { dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import type {
  GitRepo,
  GitRepoStatus,
  GitBranch,
  GitStashEntry,
  GitOperationResult,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
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

  const [branchSummary, status, stashList] = await Promise.all([
    git.branch(['-a', '-v', '--no-abbrev']),
    git.status(),
    git.stashList(),
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
    hasUncommittedChanges: !status.isClean(),
    untrackedCount: status.not_added.length,
    stagedCount: status.staged.length,
    modifiedCount: status.modified.length,
    conflictCount: status.conflicted.length,
  };
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
