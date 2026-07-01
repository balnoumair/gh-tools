import { ipcMain } from 'electron';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { getAuthStatus } from '../services/auth';
import {
  refreshPRs,
  getCachedPRs,
  setPollInterval,
} from '../services/github-poller';
import { parseUnifiedDiff } from '../services/diff-parser';
import { IPC } from '@shared/ipc-channels';
import type { PRReviewSubmitRequest } from '@shared/types';

const execFileAsync = promisify(execFile);

function ghApiJson<T>(apiPath: string, body: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const child = spawn('gh', ['api', apiPath, '--input', '-'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout) as T);
        } catch {
          resolve(stdout as T);
        }
        return;
      }
      reject(new Error(stderr.trim() || `gh api failed with code ${code}`));
    });
    child.stdin.write(JSON.stringify(body));
    child.stdin.end();
  });
}

const REVIEW_EVENT_MAP: Record<PRReviewSubmitRequest['event'], string> = {
  approve: 'APPROVE',
  request_changes: 'REQUEST_CHANGES',
  comment: 'COMMENT',
};

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
        result.patch = stdout;
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

  ipcMain.handle(IPC.GITHUB_SUBMIT_PR_REVIEW, async (_event, request: PRReviewSubmitRequest) => {
    try {
      const { stdout: metaRaw } = await execFileAsync('gh', [
        'pr', 'view', String(request.prNumber),
        '--repo', request.repoFullName,
        '--json', 'headRefOid',
      ]);
      const { headRefOid } = JSON.parse(metaRaw) as { headRefOid: string };

      const payload: Record<string, unknown> = {
        commit_id: headRefOid,
        event: REVIEW_EVENT_MAP[request.event],
        body: request.body?.trim() || undefined,
        comments: request.comments.map((comment) => {
          const item: Record<string, unknown> = {
            path: comment.filePath,
            body: comment.body,
            line: comment.lineNumber,
            side: comment.side === 'additions' ? 'RIGHT' : 'LEFT',
          };
          const start = comment.startLineNumber ?? comment.lineNumber;
          if (start !== comment.lineNumber) {
            item.start_line = start;
            const startSide = comment.startSide ?? comment.side;
            item.start_side = startSide === 'additions' ? 'RIGHT' : 'LEFT';
          }
          return item;
        }),
      };

      if (!payload.body) delete payload.body;
      if ((payload.comments as unknown[]).length === 0) delete payload.comments;

      await ghApiJson(
        `repos/${request.repoFullName}/pulls/${request.prNumber}/reviews`,
        payload,
      );

      return { success: true, message: 'Review submitted' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, message };
    }
  });
}
