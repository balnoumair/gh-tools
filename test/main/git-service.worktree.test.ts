import { mkdtemp, realpath, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn(),
  },
}));

const execFileAsync = promisify(execFile);

async function git(cwd: string, args: string[]) {
  await execFileAsync('git', args, { cwd });
}

describe('git-service worktrees', () => {
  let tempDir: string;
  let repoPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'gh-tools-worktree-'));
    repoPath = path.join(tempDir, 'repo');
    await git(tempDir, ['init', repoPath]);
    await git(repoPath, ['config', 'user.email', 'test@example.com']);
    await git(repoPath, ['config', 'user.name', 'Test User']);
    await execFileAsync('git', ['commit', '--allow-empty', '-m', 'initial'], { cwd: repoPath });
    await git(repoPath, ['branch', 'feature']);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('lists the primary worktree with status fields', async () => {
    const { listWorktrees } = await import('../../src/main/services/git-service');
    const realRepoPath = await realpath(repoPath);

    const worktrees = await listWorktrees(repoPath);

    expect(worktrees).toHaveLength(1);
    expect(worktrees[0]).toMatchObject({
      path: realRepoPath,
      primary: true,
      dirty: false,
      ahead: 0,
      behind: 0,
    });
    expect(worktrees[0].branch.length).toBeGreaterThan(0);
  });

  it('creates and removes a non-primary worktree', async () => {
    const { createWorktree, listWorktrees, removeWorktree } = await import('../../src/main/services/git-service');
    const targetPath = path.join(tempDir, 'feature-worktree');
    const realTargetPath = await realpath(tempDir).then((realTemp) => path.join(realTemp, 'feature-worktree'));

    const created = await createWorktree({ repoPath, branch: 'feature', targetPath });
    const withWorktree = await listWorktrees(repoPath);
    const removed = await removeWorktree({ repoPath, worktreePath: targetPath });
    const afterRemove = await listWorktrees(repoPath);

    expect(created.success).toBe(true);
    expect(withWorktree.some((worktree) => worktree.path === realTargetPath && !worktree.primary)).toBe(true);
    expect(removed.success).toBe(true);
    expect(afterRemove.some((worktree) => worktree.path === realTargetPath)).toBe(false);
  });

  it('refuses to create into an existing path and to remove the primary worktree', async () => {
    const { createWorktree, removeWorktree } = await import('../../src/main/services/git-service');

    const created = await createWorktree({ repoPath, branch: 'feature', targetPath: repoPath });
    const removed = await removeWorktree({ repoPath, worktreePath: repoPath });

    expect(created.success).toBe(false);
    expect(created.message).toContain('already exists');
    expect(removed.success).toBe(false);
    expect(removed.message).toContain('primary');
  });
});
