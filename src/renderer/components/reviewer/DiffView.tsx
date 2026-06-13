import React, { useState, useCallback } from 'react';
import { PatchDiff } from '@pierre/diffs/react';

// ---- Patch splitting -------------------------------------------------------

interface FilePatchMeta {
  path: string;
  status: 'added' | 'deleted' | 'modified' | 'renamed';
  patch: string;
}

function splitGitPatch(fullPatch: string): FilePatchMeta[] {
  // Split on each 'diff --git ' boundary, keeping the boundary as part of each chunk
  const parts = fullPatch.split(/(?=^diff --git )/m);
  return parts
    .filter((p) => p.trimStart().startsWith('diff --git '))
    .map((p) => {
      const lines = p.split('\n');
      const diffLine = lines[0] ?? '';
      let status: FilePatchMeta['status'] = 'modified';
      let path = '';

      // Extract new path from 'diff --git a/path b/path'
      const m = diffLine.match(/^diff --git (?:"?a\/.+?"?|a\/.+) (?:"?b\/(.+)"?|b\/(.+))$/);
      if (m) path = (m[1] ?? m[2] ?? '').replace(/^"|"$/g, '');

      for (const line of lines.slice(1, 6)) {
        if (line.startsWith('new file')) { status = 'added'; break; }
        if (line.startsWith('deleted file')) { status = 'deleted'; break; }
        if (line.startsWith('rename from') || line.startsWith('similarity index')) { status = 'renamed'; break; }
      }

      return { path, status, patch: p };
    });
}

// ---- Status glyph -----------------------------------------------------------

const STATUS_GLYPH: Record<string, { ch: string; color: string }> = {
  modified: { ch: 'M', color: 'var(--mac-orange)' },
  added:    { ch: 'A', color: 'var(--mac-green)' },
  deleted:  { ch: 'D', color: 'var(--mac-red)' },
  renamed:  { ch: 'R', color: 'var(--mac-blue)' },
};

// ---- Per-file collapsible section ------------------------------------------

interface FileSectionProps {
  file: FilePatchMeta;
}

function FileSection({ file }: FileSectionProps) {
  const [open, setOpen] = useState(true);
  const glyph = STATUS_GLYPH[file.status] ?? STATUS_GLYPH.modified;

  // Suppress Pierre's own header so ours is the only one
  const renderCustomHeader = useCallback(() => null, []);

  return (
    <div style={{ borderBottom: '1px solid var(--mac-separator)' }}>
      {/* Sticky file header */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 14px',
          cursor: 'pointer',
          background: 'rgba(19,19,21,0.95)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid var(--mac-separator)',
        }}
      >
        {/* Chevron */}
        <span
          style={{
            color: 'var(--mac-label-tertiary)',
            display: 'inline-flex',
            transform: open ? 'none' : 'rotate(-90deg)',
            transition: 'transform 0.15s',
            fontSize: 10,
          }}
        >
          ▾
        </span>

        {/* Status badge */}
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            color: glyph.color,
            border: `1px solid ${glyph.color}`,
            opacity: 0.9,
          }}
        >
          {glyph.ch}
        </span>

        {/* File path — RTL so the filename is always visible */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12.5,
            color: 'var(--mac-label)',
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            direction: 'rtl',
            textAlign: 'left',
          }}
        >
          {file.path}
        </span>
      </div>

      {/* Pierre diff */}
      {open && (
        <PatchDiff
          patch={file.patch}
          renderCustomHeader={renderCustomHeader}
          disableWorkerPool={false}
          options={{
            theme: { dark: 'github-dark-dimmed', light: 'github-dark-dimmed' },
          }}
          style={
            {
              '--diffs-dark-bg': '#131315',
              '--diffs-dark-addition-color': '#7fd49a',
              '--diffs-dark-deletion-color': '#e88f8f',
              '--diffs-font-size': '12px',
              '--diffs-line-height': '19px',
            } as React.CSSProperties
          }
        />
      )}
    </div>
  );
}

// ---- Full diff view --------------------------------------------------------

interface DiffViewProps {
  patch: string;
}

export default function DiffView({ patch }: DiffViewProps) {
  const files = splitGitPatch(patch);

  if (files.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ color: 'var(--mac-label-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
      >
        no diff
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0" style={{ background: 'var(--mac-bg-content)' }}>
      {files.map((f) => (
        <FileSection key={f.path} file={f} />
      ))}
      <div
        style={{
          padding: '14px 18px',
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--mac-label-quaternary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        ~ end of diff ~
      </div>
    </div>
  );
}
