import { ipcMain } from 'electron';
import { IPC } from '@shared/ipc-channels';
import type { ReviewDecision } from '@shared/types';
import { getPRDiff, submitReview } from '../services/pr-diff';

export function registerReviewerIpc(): void {
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
