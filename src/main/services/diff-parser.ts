import type { DiffFile, DiffHunk, DiffLine, DiffResult } from '@shared/types';

export function parseUnifiedDiff(text: string): DiffResult {
  const files: DiffFile[] = [];
  const blocks = text.split(/^diff --git /m).slice(1);

  for (const block of blocks) {
    const lines = block.split('\n');
    const headerLine = lines[0] ?? '';
    const m = headerLine.match(/^a\/(.+?) b\/(.+)$/);
    const oldPath = m?.[1] ?? '';
    const newPath = m?.[2] ?? '';

    let status: DiffFile['status'] = 'modified';
    let additions = 0;
    let deletions = 0;
    const hunks: DiffHunk[] = [];
    let currentHunk: DiffHunk | null = null;
    let oldLine = 0;
    let newLine = 0;

    for (const line of lines.slice(1)) {
      if (line.startsWith('new file mode')) {
        status = 'added';
      } else if (line.startsWith('deleted file mode')) {
        status = 'deleted';
      } else if (line.startsWith('rename from')) {
        status = 'renamed';
      } else if (
        line.startsWith('--- ') ||
        line.startsWith('+++ ') ||
        line.startsWith('index ') ||
        line.startsWith('similarity') ||
        line.startsWith('old mode') ||
        line.startsWith('new mode') ||
        line.startsWith('rename to') ||
        line.startsWith('Binary files')
      ) {
        continue;
      } else if (line.startsWith('@@ ')) {
        const hm = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (hm) {
          oldLine = parseInt(hm[1], 10);
          newLine = parseInt(hm[2], 10);
        }
        currentHunk = { header: line, lines: [] };
        hunks.push(currentHunk);
      } else if (currentHunk) {
        const dl: DiffLine =
          line.startsWith('+')
            ? { type: 'add', old: null, nw: newLine++, text: line.slice(1) }
            : line.startsWith('-')
              ? { type: 'del', old: oldLine++, nw: null, text: line.slice(1) }
              : { type: 'ctx', old: oldLine++, nw: newLine++, text: line.slice(1) };
        currentHunk.lines.push(dl);
        if (dl.type === 'add') additions++;
        else if (dl.type === 'del') deletions++;
      }
    }

    if (hunks.length > 0 || status !== 'modified') {
      files.push({
        path: newPath || oldPath,
        ...(status === 'renamed' && oldPath !== newPath ? { oldPath } : {}),
        status,
        additions,
        deletions,
        hunks,
      });
    }
  }

  const summary = {
    files: files.length,
    additions: files.reduce((s, f) => s + f.additions, 0),
    deletions: files.reduce((s, f) => s + f.deletions, 0),
  };

  return { files, summary };
}
