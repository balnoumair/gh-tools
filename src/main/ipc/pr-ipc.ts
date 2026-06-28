import { ipcMain } from 'electron';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getAuthStatus } from '../services/auth';
import {
  refreshPRs,
  getCachedPRs,
  setPollInterval,
} from '../services/github-poller';
import { parseUnifiedDiff } from '../services/diff-parser';
import { IPC } from '@shared/ipc-channels';

const execFileAsync = promisify(execFile);

/** Registers all IPC handlers used by the PR Pulse (menubar notifications) app. */
export function registerPrIpc(): void {
  ipcMain.handle(IPC.GITHUB_GET_PRS, async () => {
    return getCachedPRs();
  });

  ipcMain.handle(IPC.GITHUB_FORCE_REFRESH, async () => {
    return refreshPRs();
  });

  ipcMain.handle(IPC.GITHUB_GET_AUTH_STATUS, async () => {
    return getAuthStatus();
  });

  ipcMain.handle(IPC.GITHUB_SET_POLL_INTERVAL, async (_event, minutes: number) => {
    setPollInterval(minutes);
  });

  ipcMain.handle(
    IPC.GITHUB_GET_PR_DIFF,
    async (_event, prNumber: number, repoFullName: string) => {
      try {
        const { stdout } = await execFileAsync('gh', [
          'pr', 'diff', String(prNumber),
          '--repo', repoFullName,
        ]);
        const result = parseUnifiedDiff(stdout);
        // Inject base/head from gh pr view
        try {
          const { stdout: meta } = await execFileAsync('gh', [
            'pr', 'view', String(prNumber),
            '--repo', repoFullName,
            '--json', 'baseRefName,headRefName',
          ]);
          const { baseRefName, headRefName } = JSON.parse(meta) as { baseRefName: string; headRefName: string };
          result.base = baseRefName;
          result.head = headRefName;
        } catch {
          // best effort
        }
        return result;
      } catch (err) {
        return { files: [], summary: { files: 0, additions: 0, deletions: 0 }, error: String(err) };
      }
    },
  );
}
