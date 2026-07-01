import React from 'react';
import type { DiffFile } from '@shared/types';
import { FileDiff } from './FileDiff';
import { usePRReviewStore, EMPTY_REVIEW_COMMENTS, EMPTY_REVIEW_DRAFT } from '../../stores/pr-review-store';

function ComposePanel({ prId }: { prId: number }) {
  const draft = usePRReviewStore((s) => s.drafts[prId]);
  const setComposeText = usePRReviewStore((s) => s.setComposeText);
  const saveCompose = usePRReviewStore((s) => s.saveCompose);
  const cancelCompose = usePRReviewStore((s) => s.cancelCompose);

  if (!draft?.composing) return null;

  const btn = (primary: boolean, disabled = false): React.CSSProperties => ({
    height: 28, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    background: primary ? (disabled ? 'rgba(139,143,240,0.25)' : '#8b8ff0') : 'transparent',
    color: primary ? (disabled ? 'rgba(255,255,255,0.35)' : '#0e0f14') : 'rgba(255,255,255,0.65)',
    border: primary ? 'none' : '1px solid rgba(255,255,255,0.12)',
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <div style={{
      margin: '0 12px 12px', padding: 12, borderRadius: 8,
      background: 'rgba(16,17,22,0.98)', border: '1px solid rgba(139,143,240,0.35)',
    }}>
      <div style={{
        fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11,
        color: 'rgba(255,255,255,0.45)', marginBottom: 8,
      }}>
        Comment on {draft.composing.filePath}:{draft.composing.lineNumber}
      </div>
      <textarea
        value={draft.composeText}
        onChange={(e) => setComposeText(prId, e.target.value)}
        autoFocus
        placeholder="Leave a review comment…"
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6, padding: '8px 10px', outline: 'none',
          color: 'rgba(255,255,255,0.92)', fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 12.5, lineHeight: 1.45,
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveCompose(prId);
          if (e.key === 'Escape') cancelCompose(prId);
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={() => cancelCompose(prId)} style={btn(false)}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() => saveCompose(prId)}
          disabled={!draft.composeText.trim()}
          style={btn(true, !draft.composeText.trim())}
        >
          Add comment
        </button>
      </div>
    </div>
  );
}

export function PRDiffFiles({
  files,
  prId,
}: {
  files: DiffFile[];
  prId: number;
}) {
  const comments = usePRReviewStore((s) => s.drafts[prId]?.comments ?? EMPTY_REVIEW_COMMENTS);
  const composing = usePRReviewStore((s) => s.drafts[prId]?.composing ?? null);
  const startCompose = usePRReviewStore((s) => s.startCompose);
  const removeComment = usePRReviewStore((s) => s.removeComment);

  if (files.length === 0) {
    return (
      <div style={{
        padding: '24px 18px', textAlign: 'center',
        fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.25)',
      }}>
        No diff available
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11.5,
        color: 'rgba(255,255,255,0.4)',
      }}>
        Click a line number to add a review comment.
      </div>
      {files.map((file) => (
        <div key={file.path}>
          <FileDiff
            file={file}
            review={{
              comments: comments.filter((c) => c.filePath === file.path),
              composing: composing?.filePath === file.path ? composing : null,
              onLineClick: (side, lineNumber) => {
                startCompose(prId, { filePath: file.path, side, lineNumber });
              },
              onRemoveComment: (commentId) => removeComment(prId, commentId),
            }}
          />
          {composing?.filePath === file.path && <ComposePanel prId={prId} />}
        </div>
      ))}
      <div style={{
        padding: '14px 18px', textAlign: 'center', fontSize: 11,
        color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--gh-font-mono, monospace)',
      }}>
        ~ end of diff ~
      </div>
    </>
  );
}
