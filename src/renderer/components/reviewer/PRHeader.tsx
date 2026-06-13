import React, { useRef, useEffect } from 'react';
import type { PullRequest, PRDiffMeta, ReviewDecision } from '@shared/types';

// ---- Branch chip -----------------------------------------------------------

function BranchChip({ name }: { name: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--mac-label-secondary)',
        padding: '2px 8px',
        borderRadius: 5,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--mac-separator)',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </span>
  );
}

// ---- Review action button --------------------------------------------------

interface ReviewActionProps {
  children: React.ReactNode;
  tone: string;
  active: boolean;
  onClick: () => void;
}

function ReviewAction({ children, tone, active, onClick }: ReviewActionProps) {
  return (
    <button
      onClick={onClick}
      className="focus:outline-none"
      style={{
        height: 28,
        padding: '0 12px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        color: tone,
        border: `1px solid ${active ? tone : 'var(--mac-separator-heavy)'}`,
        background: active ? `color-mix(in srgb, ${tone} 14%, transparent)` : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
      }}
    >
      {children}
    </button>
  );
}

// ---- PR header band --------------------------------------------------------

interface PRHeaderProps {
  pr: PullRequest;
  meta: PRDiffMeta;
  decision: ReviewDecision | null;
  onSetDecision: (d: ReviewDecision | null) => void;
  reviewBody: string;
  onSetBody: (body: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  onClearError: () => void;
}

export default function PRHeader({
  pr,
  meta,
  decision,
  onSetDecision,
  reviewBody,
  onSetBody,
  onSubmit,
  isSubmitting,
  submitError,
  onClearError,
}: PRHeaderProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const needsBody = decision === 'request_changes' || decision === 'comment';

  useEffect(() => {
    if (needsBody) bodyRef.current?.focus();
  }, [needsBody]);

  const toggleDecision = (d: ReviewDecision) => {
    onSetDecision(decision === d ? null : d);
    if (submitError) onClearError();
  };

  return (
    <div
      style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--mac-separator)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)',
        flexShrink: 0,
      }}
    >
      {/* Title row */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            color: 'var(--mac-label-tertiary)',
            flexShrink: 0,
          }}
        >
          #{pr.number}
        </span>
        <span
          className="flex-1 min-w-0 truncate"
          style={{ fontSize: 16, fontWeight: 600, color: 'var(--mac-label)', letterSpacing: '-0.01em' }}
        >
          {pr.title}
        </span>
        <button
          onClick={() => window.electronAPI.openExternal(pr.url)}
          className="focus:outline-none shrink-0"
          style={{ fontSize: 11.5, color: 'var(--mac-label-tertiary)', cursor: 'pointer' }}
        >
          GitHub ↗
        </button>
      </div>

      {/* Meta row */}
      <div
        className="flex items-center flex-wrap gap-2"
        style={{ fontSize: 12, color: 'var(--mac-label-tertiary)', fontFamily: 'var(--font-mono)' }}
      >
        <BranchChip name={meta.base} />
        <span style={{ color: 'var(--mac-label-quaternary)' }}>←</span>
        <BranchChip name={meta.head} />
        <span
          style={{
            width: 1,
            height: 12,
            background: 'var(--mac-separator-heavy)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span>
          <span style={{ color: '#7fd49a' }}>+{meta.additions}</span>{' '}
          <span style={{ color: '#e88f8f' }}>−{meta.deletions}</span>{' '}
          <span style={{ color: 'var(--mac-label-quaternary)' }}>
            · {meta.files} files · {meta.commits} commits
          </span>
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {pr.author.login} · {formatAge(pr.updatedAt)}
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">
        <ReviewAction tone="#6CB67A" active={decision === 'approve'} onClick={() => toggleDecision('approve')}>
          ✓ Approve
        </ReviewAction>
        <ReviewAction tone="#E36F6F" active={decision === 'request_changes'} onClick={() => toggleDecision('request_changes')}>
          Request changes
        </ReviewAction>
        <ReviewAction tone="var(--mac-label-secondary)" active={decision === 'comment'} onClick={() => toggleDecision('comment')}>
          Comment
        </ReviewAction>

        {decision && (
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--mac-label-tertiary)',
              fontFamily: 'var(--font-mono)',
              marginLeft: 4,
            }}
          >
            {decision === 'approve'
              ? '✓ approved'
              : decision === 'request_changes'
                ? '✗ changes requested'
                : '✎ comment'}
          </span>
        )}
      </div>

      {/* Body textarea — shown for request_changes / comment */}
      {needsBody && (
        <div className="flex flex-col gap-2">
          <textarea
            ref={bodyRef}
            value={reviewBody}
            onChange={(e) => onSetBody(e.target.value)}
            placeholder={
              decision === 'request_changes'
                ? "Describe the changes you're requesting…"
                : 'Leave a comment…'
            }
            rows={3}
            className="mac-input resize-none"
            style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.5 }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onSubmit}
              disabled={isSubmitting || !reviewBody.trim()}
              className="focus:outline-none"
              style={{
                height: 28,
                padding: '0 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--mac-separator-heavy)',
                color: isSubmitting || !reviewBody.trim() ? 'var(--mac-label-quaternary)' : 'var(--mac-label)',
                cursor: isSubmitting || !reviewBody.trim() ? 'default' : 'pointer',
              }}
            >
              {isSubmitting ? 'Submitting…' : 'Submit review'}
            </button>
            {submitError && (
              <span style={{ fontSize: 11.5, color: 'var(--mac-red)' }}>{submitError}</span>
            )}
          </div>
        </div>
      )}

      {/* Approve submit (no body needed) */}
      {decision === 'approve' && (
        <div className="flex items-center gap-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="focus:outline-none"
            style={{
              height: 28,
              padding: '0 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              background: 'color-mix(in srgb, #6CB67A 14%, transparent)',
              border: '1px solid #6CB67A',
              color: isSubmitting ? 'var(--mac-label-quaternary)' : '#6CB67A',
              cursor: isSubmitting ? 'default' : 'pointer',
            }}
          >
            {isSubmitting ? 'Submitting…' : 'Submit approval'}
          </button>
          {submitError && (
            <span style={{ fontSize: 11.5, color: 'var(--mac-red)' }}>{submitError}</span>
          )}
        </div>
      )}
    </div>
  );
}

function formatAge(updatedAt: string): string {
  const diff = Date.now() - new Date(updatedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
