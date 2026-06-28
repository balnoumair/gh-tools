import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SelectedLineRange } from '@pierre/diffs';
import { processPatch } from '@pierre/diffs';
import {
  FileDiff as PierreFileDiff,
  type DiffLineAnnotation,
  type FileDiffMetadata,
} from '@pierre/diffs/react';
import type { PRReviewCommentDraft } from '@shared/types';
import {
  usePRReviewStore,
  EMPTY_REVIEW_COMMENTS,
  type ReviewComposeTarget,
} from '../../stores/pr-review-store';

export type ReviewAnnotationMeta = {
  kind: 'comment';
  commentId: string;
  body: string;
};

const PIERRE_DIFF_OPTIONS = {
  themeType: 'dark' as const,
  theme: 'github-dark',
  diffStyle: 'unified' as const,
  diffIndicators: 'bars' as const,
  lineDiffType: 'word' as const,
  hunkSeparators: 'metadata' as const,
  overflow: 'wrap' as const,
  lineHoverHighlight: 'both' as const,
  enableLineSelection: true,
  enableGutterUtility: true,
};

function annotationsForFile(
  filePath: string,
  comments: PRReviewCommentDraft[],
  composing: ReviewComposeTarget | null,
): DiffLineAnnotation<ReviewAnnotationMeta>[] {
  const items: DiffLineAnnotation<ReviewAnnotationMeta>[] = [];

  for (const comment of comments.filter((c) => c.filePath === filePath)) {
    const end = comment.lineNumber;
    const start = comment.startLineNumber ?? end;
    const body = start !== end
      ? `${comment.body}\n(${start}–${end})`
      : comment.body;
    items.push({
      side: comment.side,
      lineNumber: end,
      metadata: {
        kind: 'comment',
        commentId: comment.id,
        body,
      },
    });
  }

  if (composing && composing.filePath === filePath) {
    items.push({
      side: composing.side,
      lineNumber: composing.lineNumber,
      metadata: {
        kind: 'comment',
        commentId: '__draft__',
        body: '',
      },
    });
  }

  return items;
}

function composeBtnStyle(primary: boolean, disabled = false): React.CSSProperties {
  return {
    height: 28, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    background: primary ? (disabled ? 'rgba(139,143,240,0.25)' : '#8b8ff0') : 'transparent',
    color: primary ? (disabled ? 'rgba(255,255,255,0.35)' : '#0e0f14') : 'rgba(255,255,255,0.65)',
    border: primary ? 'none' : '1px solid rgba(255,255,255,0.12)',
    opacity: disabled ? 0.6 : 1,
  };
}

function formatComposeLabel(target: ReviewComposeTarget): string {
  const start = target.startLineNumber ?? target.lineNumber;
  const end = target.lineNumber;
  if (start !== end) return `lines ${start}–${end}`;
  return `line ${end}`;
}

function rangeFromTarget(target: ReviewComposeTarget): SelectedLineRange {
  const start = target.startLineNumber ?? target.lineNumber;
  const end = target.lineNumber;
  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
    side: target.startSide ?? target.side,
    endSide: target.side,
  };
}

function targetFromRange(filePath: string, range: SelectedLineRange): ReviewComposeTarget {
  const start = Math.min(range.start, range.end);
  const end = Math.max(range.start, range.end);
  const side = range.endSide ?? range.side ?? 'additions';
  const startSide = range.side ?? range.endSide ?? side;
  return {
    filePath,
    side,
    lineNumber: end,
    startLineNumber: start !== end ? start : undefined,
    startSide: start !== end ? startSide : undefined,
  };
}

function singleLineRange(
  lineNumber: number,
  side: 'additions' | 'deletions',
): SelectedLineRange {
  return { start: lineNumber, end: lineNumber, side, endSide: side };
}

function ReviewAnnotation({
  annotation,
  onRemove,
}: {
  annotation: DiffLineAnnotation<ReviewAnnotationMeta>;
  onRemove?: () => void;
}) {
  const body = annotation.metadata?.body ?? '';
  return (
    <div style={{
      margin: '6px 12px 8px',
      padding: '10px 12px',
      borderRadius: 8,
      background: 'rgba(28,28,32,0.98)',
      border: '1px solid rgba(255,255,255,0.12)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>
          Review comment
        </span>
        {onRemove && (
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
      <div style={{ fontSize: 12.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
        {body}
      </div>
    </div>
  );
}

function ComposeBox({
  prId,
  label,
  onDismiss,
}: {
  prId: number;
  label: string;
  onDismiss: () => void;
}) {
  const draft = usePRReviewStore((s) => s.drafts[prId]);
  const setComposeText = usePRReviewStore((s) => s.setComposeText);
  const saveCompose = usePRReviewStore((s) => s.saveCompose);
  const cancelCompose = usePRReviewStore((s) => s.cancelCompose);

  if (!draft?.composing) return null;

  const dismiss = () => {
    cancelCompose(prId);
    onDismiss();
  };

  const submit = () => {
    saveCompose(prId);
    onDismiss();
  };

  return (
    <div style={{
      margin: '6px 12px 8px',
      padding: '10px 12px',
      borderRadius: 8,
      background: 'rgba(139,143,240,0.08)',
      border: '1px solid rgba(139,143,240,0.35)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11,
        color: 'rgba(255,255,255,0.45)', marginBottom: 8,
      }}>
        Comment on {label}
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
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          if (e.key === 'Escape') dismiss();
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={dismiss} style={composeBtnStyle(false)}>
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!draft.composeText.trim()}
          style={composeBtnStyle(true, !draft.composeText.trim())}
        >
          Add comment
        </button>
      </div>
    </div>
  );
}

function PierreFileDiffView({
  fileDiff,
  prId,
  comments,
  composing,
  onRangeSelect,
  onRemoveComment,
}: {
  fileDiff: FileDiffMetadata;
  prId: number;
  comments: PRReviewCommentDraft[];
  composing: ReviewComposeTarget | null;
  onRangeSelect: (target: ReviewComposeTarget) => void;
  onRemoveComment: (commentId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragSelection, setDragSelection] = useState<SelectedLineRange | null>(null);

  const clearSelection = useCallback(() => {
    setDragSelection(null);
  }, []);

  const isComposingHere = composing?.filePath === fileDiff.name;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || isComposingHere) return;
      clearSelection();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isComposingHere, clearSelection]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (isComposingHere) return;
      const root = containerRef.current;
      if (!root || root.contains(e.target as Node)) return;
      clearSelection();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isComposingHere, clearSelection]);

  const lineAnnotations = useMemo(
    () => annotationsForFile(fileDiff.name, comments, composing),
    [fileDiff.name, comments, composing],
  );

  const selectedLines = useMemo((): SelectedLineRange | null => {
    if (isComposingHere && composing) return rangeFromTarget(composing);
    return dragSelection;
  }, [isComposingHere, composing, dragSelection]);

  const composeLabel = composing && isComposingHere
    ? formatComposeLabel(composing)
    : '';

  const renderAnnotation = useCallback((annotation: DiffLineAnnotation<ReviewAnnotationMeta>) => {
    const meta = annotation.metadata;
    if (!meta) return null;
    if (meta.commentId === '__draft__') {
      return (
        <ComposeBox
          prId={prId}
          label={composeLabel}
          onDismiss={clearSelection}
        />
      );
    }
    return (
      <ReviewAnnotation
        annotation={annotation}
        onRemove={() => onRemoveComment(meta.commentId)}
      />
    );
  }, [prId, composeLabel, clearSelection, onRemoveComment]);

  const options = useMemo(() => ({
    ...PIERRE_DIFF_OPTIONS,
    onLineNumberClick: (props: { lineNumber: number; side?: 'deletions' | 'additions' }) => {
      const side = props.side ?? 'additions';
      setDragSelection(singleLineRange(props.lineNumber, side));
    },
    onGutterUtilityClick: (range: SelectedLineRange) => {
      onRangeSelect(targetFromRange(fileDiff.name, range));
    },
    onLineSelectionChange: (range: SelectedLineRange | null) => {
      if (!isComposingHere) setDragSelection(range);
    },
    onLineSelectionEnd: (range: SelectedLineRange | null) => {
      if (!isComposingHere) setDragSelection(range);
    },
  }), [fileDiff.name, onRangeSelect, isComposingHere]);

  return (
    <div ref={containerRef} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <PierreFileDiff
        fileDiff={fileDiff}
        lineAnnotations={lineAnnotations}
        selectedLines={selectedLines}
        renderAnnotation={renderAnnotation}
        options={options}
        disableWorkerPool
        style={{ display: 'block', width: '100%' }}
      />
    </div>
  );
}

export function PierrePRDiff({
  patch,
  prId,
}: {
  patch: string;
  prId: number;
}) {
  const comments = usePRReviewStore((s) => s.drafts[prId]?.comments ?? EMPTY_REVIEW_COMMENTS);
  const composing = usePRReviewStore((s) => s.drafts[prId]?.composing ?? null);
  const startCompose = usePRReviewStore((s) => s.startCompose);
  const removeComment = usePRReviewStore((s) => s.removeComment);

  const files = useMemo(() => {
    try {
      return processPatch(patch, `pr-${prId}`).files;
    } catch {
      return [];
    }
  }, [patch, prId]);

  const onRangeSelect = useCallback((target: ReviewComposeTarget) => {
    startCompose(prId, target);
  }, [prId, startCompose]);

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
        Select lines (click or drag), then click + to comment. Press Esc to clear selection.
      </div>
      {files.map((fileDiff) => (
        <PierreFileDiffView
          key={fileDiff.cacheKey ?? fileDiff.name}
          fileDiff={fileDiff}
          prId={prId}
          comments={comments}
          composing={composing}
          onRangeSelect={onRangeSelect}
          onRemoveComment={(id) => removeComment(prId, id)}
        />
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
