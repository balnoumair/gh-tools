import React, { useState } from 'react';
import type { DiffFile, DiffLine as DiffLineData, PRReviewCommentDraft } from '@shared/types';
import type { ReviewComposeTarget } from '../../stores/pr-review-store';

export type FileDiffReviewProps = {
  comments: PRReviewCommentDraft[];
  composing: ReviewComposeTarget | null;
  onLineClick: (side: 'additions' | 'deletions', lineNumber: number) => void;
  onRemoveComment: (commentId: string) => void;
};

const REV = {
  addFg: '#7fd49a', addBg: 'rgba(110,196,138,0.10)', addGutter: 'rgba(110,196,138,0.16)',
  delFg: '#e88f8f', delBg: 'rgba(224,122,122,0.10)', delGutter: 'rgba(224,122,122,0.16)',
  hunkFg: '#8aaed8',
};

const STATUS_GLYPH: Record<DiffFile['status'], { ch: string; tone: string }> = {
  modified: { ch: 'M', tone: '#d9c98a' },
  added:    { ch: 'A', tone: '#7fd49a' },
  deleted:  { ch: 'D', tone: '#e88f8f' },
  renamed:  { ch: 'R', tone: '#8fa6e6' },
};

function LineComment({
  body, isDraft, onRemove,
}: { body: string; isDraft?: boolean; onRemove?: () => void }) {
  return (
    <div style={{
      margin: '4px 12px 6px 92px', padding: '8px 10px', borderRadius: 6,
      background: isDraft ? 'rgba(139,143,240,0.08)' : 'rgba(28,28,32,0.98)',
      border: `1px solid ${isDraft ? 'rgba(139,143,240,0.35)' : 'rgba(255,255,255,0.12)'}`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          color: isDraft ? '#8b8ff0' : 'rgba(255,255,255,0.45)',
        }}>
          {isDraft ? 'Draft comment' : 'Review comment'}
        </span>
        {!isDraft && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.4)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            Remove
          </button>
        )}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
        {body}
      </div>
    </div>
  );
}

function DiffLine({
  ln, review,
}: {
  ln: DiffLineData;
  review?: FileDiffReviewProps;
}) {
  const isAdd = ln.type === 'add';
  const isDel = ln.type === 'del';
  const bg = isAdd ? REV.addBg : isDel ? REV.delBg : 'transparent';
  const gutterBg = isAdd ? REV.addGutter : isDel ? REV.delGutter : 'transparent';
  const sign = isAdd ? '+' : isDel ? '-' : ' ';
  const codeFg = isAdd ? REV.addFg : isDel ? REV.delFg : 'rgba(255,255,255,0.7)';
  const interactive = review != null;

  const gut = (side: 'additions' | 'deletions', lineNumber: number | null): React.CSSProperties => ({
    textAlign: 'right', padding: '0 8px', color: 'rgba(255,255,255,0.25)',
    fontSize: 11, userSelect: 'none', background: gutterBg,
    borderRight: '1px solid rgba(255,255,255,0.05)',
    cursor: interactive && lineNumber != null ? 'pointer' : 'default',
  });

  const lineComments = review?.comments.filter((c) => {
    if (c.side === 'deletions' && ln.old != null) return c.lineNumber === ln.old;
    if (c.side === 'additions' && ln.nw != null) return c.lineNumber === ln.nw;
    return false;
  }) ?? [];

  const isComposingHere = review?.composing && (
    (review.composing.side === 'deletions' && review.composing.lineNumber === ln.old)
    || (review.composing.side === 'additions' && review.composing.lineNumber === ln.nw)
  );

  return (
    <>
      <div style={{
        display: 'grid', gridTemplateColumns: '46px 46px 1fr',
        background: bg, lineHeight: '19px', minHeight: 19,
      }}>
        <span
          style={gut('deletions', ln.old)}
          onClick={() => {
            if (review && ln.old != null) review.onLineClick('deletions', ln.old);
          }}
        >
          {ln.old ?? ''}
        </span>
        <span
          style={gut('additions', ln.nw)}
          onClick={() => {
            if (review && ln.nw != null) review.onLineClick('additions', ln.nw);
          }}
        >
          {ln.nw ?? ''}
        </span>
        <span style={{ display: 'flex', paddingLeft: 6, paddingRight: 12, whiteSpace: 'pre', color: codeFg, fontSize: 12 }}>
          <span style={{
            width: 12, flexShrink: 0,
            color: isAdd ? REV.addFg : isDel ? REV.delFg : 'rgba(255,255,255,0.25)',
            opacity: sign === ' ' ? 0 : 0.9,
          }}>{sign}</span>
          <span style={{ flex: 1 }}>{ln.text || ' '}</span>
        </span>
      </div>
      {isComposingHere && (
        <LineComment body="Add a review comment…" isDraft />
      )}
      {lineComments.map((c) => (
        <LineComment
          key={c.id}
          body={c.body}
          onRemove={() => review?.onRemoveComment(c.id)}
        />
      ))}
    </>
  );
}

export function FileDiff({
  file,
  review,
}: {
  file: DiffFile;
  review?: FileDiffReviewProps;
}) {
  const [open, setOpen] = useState(true);
  const g = STATUS_GLYPH[file.status] ?? STATUS_GLYPH.modified;
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'sticky', top: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', cursor: 'pointer',
          background: 'rgba(26,26,29,0.94)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <svg
          width="12" height="12" viewBox="0 0 8 8" fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s', flexShrink: 0 }}
        >
          <path d="M1 2.5L4 5.5L7 2.5" />
        </svg>
        <span style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10, fontWeight: 700,
          color: g.tone, border: `1px solid ${g.tone}`, opacity: 0.9,
        }}>{g.ch}</span>
        <span style={{
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12.5,
          color: 'rgba(255,255,255,0.9)', flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          direction: 'rtl', textAlign: 'left',
        }}>{file.path}</span>
        <span style={{
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11, flexShrink: 0,
          display: 'flex', gap: 8,
        }}>
          <span style={{ color: REV.addFg }}>+{file.additions}</span>
          <span style={{ color: REV.delFg }}>−{file.deletions}</span>
        </span>
      </div>
      {open && (
        <div style={{ fontFamily: 'var(--gh-font-mono, monospace)' }}>
          {file.hunks.map((h, i) => (
            <div key={i}>
              <div style={{
                padding: '3px 14px 3px 92px', fontSize: 11, color: REV.hunkFg,
                background: 'rgba(138,174,216,0.06)',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{h.header}</div>
              {h.lines.map((ln, j) => <DiffLine key={j} ln={ln} review={review} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DiffSectionBand({
  icon, label, count, tone,
}: {
  icon: React.ReactNode; label: string; count?: number; tone?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
      background: 'rgba(0,0,0,0.22)',
      borderTop: '1px solid rgba(255,255,255,0.09)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10.5,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span style={{ color: tone ?? 'rgba(255,255,255,0.45)', display: 'inline-flex' }}>{icon}</span>
      <span style={{ color: tone ?? 'rgba(255,255,255,0.45)' }}>{label}</span>
      {count != null && <span style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>}
    </div>
  );
}
