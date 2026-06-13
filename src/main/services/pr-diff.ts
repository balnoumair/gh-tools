import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { PRDiffMeta, ReviewDecision } from '@shared/types';

const execAsync = promisify(execFile);

interface GhPRView {
  baseRefName: string;
  headRefName: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: unknown[];
}

export async function getPRDiff(
  repoFullName: string,
  number: number,
): Promise<{ meta: PRDiffMeta; patch: string }> {
  const [viewResult, diffResult] = await Promise.all([
    execAsync(
      'gh',
      [
        'pr', 'view', String(number),
        '-R', repoFullName,
        '--json', 'baseRefName,headRefName,additions,deletions,changedFiles,commits',
      ],
      { maxBuffer: 5 * 1024 * 1024, timeout: 30_000 },
    ),
    execAsync(
      'gh',
      ['pr', 'diff', String(number), '-R', repoFullName],
      { maxBuffer: 20 * 1024 * 1024, timeout: 60_000 },
    ),
  ]);

  const view = JSON.parse(viewResult.stdout) as GhPRView;
  const meta: PRDiffMeta = {
    base: view.baseRefName,
    head: view.headRefName,
    additions: view.additions,
    deletions: view.deletions,
    files: view.changedFiles,
    commits: view.commits.length,
  };

  return { meta, patch: diffResult.stdout };
}

export async function submitReview(
  repoFullName: string,
  number: number,
  decision: ReviewDecision,
  body?: string,
): Promise<void> {
  const flag =
    decision === 'approve'
      ? '--approve'
      : decision === 'request_changes'
        ? '--request-changes'
        : '--comment';

  const args = ['pr', 'review', String(number), '-R', repoFullName, flag];
  if (body) args.push('-b', body);

  await execAsync('gh', args, { timeout: 30_000 });
}
