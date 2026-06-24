import { ipcMain } from 'electron';
import os from 'node:os';
import { IPC } from '@shared/ipc-channels';
import type { EditorTarget, ReviewDecision } from '@shared/types';
import { openInEditor } from '../services/editor-launcher';
import { getPRDiff, submitReview } from '../services/pr-diff';

export function registerReviewerIpc(): void {
  ipcMain.handle(IPC.REVIEWER_GET_HOMEDIR, () => os.homedir());

  ipcMain.handle(
    IPC.EDITOR_OPEN,
    async (_event, target: EditorTarget, targetPath: string) => {
      return openInEditor(target, targetPath);
    },
  );

  ipcMain.handle(
    IPC.REVIEWER_GET_DIFF,
    async (_event, repoFullName: string, number: number) => {
      return getPRDiff(repoFullName, number);
    },
  );

  ipcMain.handle(
    IPC.REVIEWER_SUBMIT_REVIEW,
    async (
      _event,
      repoFullName: string,
      number: number,
      decision: ReviewDecision,
      body?: string,
    ) => {
      await submitReview(repoFullName, number, decision, body);
    },
  );
}
