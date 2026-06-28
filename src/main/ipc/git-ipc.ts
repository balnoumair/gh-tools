import { ipcMain } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseUnifiedDiff } from '../services/diff-parser';

const execFileAsync = promisify(execFile);
import * as gitService from '../services/git-service';
import {
  loadSharedRecents,
  migrateLegacyRecents,
  removeSharedRecent,
  touchSharedRecent,
} from '../services/recents-store';
import type { SharedRecentRepo } from '@shared/recents';
import { openInEditor } from '../services/editor-launcher';
import { IPC } from '@shared/ipc-channels';
import type {
  EditorTarget,
  GitRepo,
  MergeOptions,
  PushOptions,
  UpdateOptions,
  StashCreateOptions,
  StashApplyOptions,
  WorktreeCreateOptions,
  WorktreeRemoveOptions,
  WorktreeCommitOptions,
} from '@shared/types';

/** Registers all IPC handlers used by the Git Manager (project management) app. */
export function registerGitIpc(): void {
  ipcMain.handle(
    IPC.GIT_LOAD_RECENTS,
    async (_event, legacy?: Array<{ path: string; name: string }>) => {
      const legacyWithTime: SharedRecentRepo[] = (legacy ?? []).map((repo) => ({
        path: repo.path,
        name: repo.name,
        openedAt: Date.now(),
      }));
      await migrateLegacyRecents(legacyWithTime);
      return loadSharedRecents();
    },
  );

  ipcMain.handle(IPC.GIT_TOUCH_RECENT, async (_event, repo: GitRepo) => {
    return touchSharedRecent(repo);
  });

  ipcMain.handle(IPC.GIT_REMOVE_RECENT, async (_event, repoPath: string) => {
    return removeSharedRecent(repoPath);
  });

  ipcMain.handle(IPC.GIT_SELECT_REPO, async () => {
    const repo = await gitService.selectRepo();
    if (repo) await touchSharedRecent(repo);
    return repo;
  });

  ipcMain.handle(IPC.GIT_GET_REPO_STATUS, async (_e, repoPath: string) => {
    return gitService.getRepoStatus(repoPath);
  });

  ipcMain.handle(IPC.GIT_LIST_WORKTREES, async (_e, repoPath: string) => {
    return gitService.listWorktrees(repoPath);
  });

  ipcMain.handle(IPC.GIT_CREATE_WORKTREE, async (_e, opts: WorktreeCreateOptions) => {
    return gitService.createWorktree(opts);
  });

  ipcMain.handle(IPC.GIT_REMOVE_WORKTREE, async (_e, opts: WorktreeRemoveOptions) => {
    return gitService.removeWorktree(opts);
  });

  ipcMain.handle(IPC.GIT_COMMIT_WORKTREE, async (_e, opts: WorktreeCommitOptions) => {
    return gitService.commitWorktree(opts);
  });

  ipcMain.handle(IPC.GIT_CHECKOUT_BRANCH, async (_e, repoPath: string, branch: string) => {
    return gitService.checkoutBranch(repoPath, branch);
  });

  ipcMain.handle(IPC.GIT_CREATE_BRANCH, async (_e, repoPath: string, name: string, startPoint?: string) => {
    return gitService.createBranch(repoPath, name, startPoint);
  });

  ipcMain.handle(IPC.GIT_DELETE_BRANCH, async (_e, repoPath: string, branch: string, force?: boolean) => {
    return gitService.deleteBranch(repoPath, branch, force);
  });

  ipcMain.handle(IPC.GIT_MERGE, async (_e, opts: MergeOptions) => {
    return gitService.merge(opts);
  });

  ipcMain.handle(IPC.GIT_PUSH, async (_e, opts: PushOptions) => {
    return gitService.push(opts);
  });

  ipcMain.handle(IPC.GIT_FETCH, async (_e, repoPath: string, remote?: string) => {
    return gitService.fetch(repoPath, remote);
  });

  ipcMain.handle(IPC.GIT_PULL, async (_e, opts: UpdateOptions) => {
    return gitService.pull(opts);
  });

  ipcMain.handle(IPC.GIT_STASH_CREATE, async (_e, opts: StashCreateOptions) => {
    return gitService.stashCreate(opts);
  });

  ipcMain.handle(IPC.GIT_STASH_APPLY, async (_e, opts: StashApplyOptions) => {
    return gitService.stashApply(opts);
  });

  ipcMain.handle(IPC.GIT_STASH_DROP, async (_e, repoPath: string, stashIndex: number) => {
    return gitService.stashDrop(repoPath, stashIndex);
  });

  ipcMain.handle(IPC.EDITOR_OPEN, async (_e, target: EditorTarget, targetPath: string) => {
    return openInEditor(target, targetPath);
  });

  ipcMain.handle(IPC.GIT_GET_WORKTREE_DIFF, async (_e, worktreePath: string) => {
    const run = async (args: string[]) => {
      try {
        const { stdout } = await execFileAsync('git', ['-C', worktreePath, ...args]);
        return stdout;
      } catch {
        return '';
      }
    };

    const [uncommittedText, committedText] = await Promise.all([
      run(['diff', 'HEAD']),
      run(['log', '--patch', '--format=', 'origin/main..HEAD']),
    ]);

    return {
      uncommitted: parseUnifiedDiff(uncommittedText),
      committed: parseUnifiedDiff(committedText),
    };
  });
}
