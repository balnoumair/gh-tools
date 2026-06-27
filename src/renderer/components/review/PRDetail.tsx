import React, { useEffect, useState } from 'react';
import type { PullRequest, DiffResult } from '@shared/types';
import { FileDiff } from './FileDiff';

type ReviewDecision = 'approve' | 'reject' | 'comment' | null;

function BranchChip({ name }: { name: string }) {
  return (
    <span style={{
      fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11.5,
      color: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: 5,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
      whiteSpace: 'nowrap',
    }}>{name}</span>
  );
}

function CIDot({ ciStatus }: { ciStatus: PullRequest['ciStatus'] }) {
  const color =
    ciStatus === 'success' ? '#6fcf97'
    : ciStatus === 'failure' ? '#e98b8b'
    : ciStatus === 'pending' ? '#d9c98a'
    : 'rgba(255,255,255,0.25)';
  const label =
    ciStatus === 'success' ? 'checks passing'
    : ciStatus === 'failure' ? 'checks failing'
    : ciStatus === 'pending' ? 'checks running'
    : 'no checks';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--gh-font-mono, monospace)', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </span>
  );
}

function ReviewBtn({
  children, tone, active, onClick,
}: {
  children: React.ReactNode; tone?: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      height: 28, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
      color: tone ?? 'rgba(255,255,255,0.6)',
      border: `1px solid ${active ? (tone ?? 'rgba(255,255,255,0.3)') : 'rgba(255,255,255,0.12)'}`,
      background: active ? `color-mix(in srgb, ${tone ?? 'white'} 14%, transparent)` : 'transparent',
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    }}>
      {children}
    </button>
  );
}

function CheckoutBtn({
  hasWorktree, onClick,
}: { hasWorktree: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      height: 28, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: hasWorktree ? 'rgba(255,255,255,0.04)' : '#8b8ff0',
      color: hasWorktree ? 'rgba(255,255,255,0.8)' : '#0e0f14',
      border: hasWorktree ? '1px solid rgba(255,255,255,0.12)' : 'none',
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
      {hasWorktree ? 'Go to worktree' : 'Checkout as worktree'}
    </button>
  );
}

export function PRDetail({
  pr, hasWorktree, onCheckout,
}: {
  pr: PullRequest;
  hasWorktree: boolean;
  onCheckout: () => void;
}) {
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [decided, setDecided] = useState<ReviewDecision>(null);

  useEffect(() => {
    setLoading(true);
    setDiff(null);
    window.electronAPI.getPRDiff(pr.number, pr.repoFullName)
      .then((d) => setDiff(d))
      .catch(() => setDiff({ files: [], summary: { files: 0, additions: 0, deletions: 0 } }))
      .finally(() => setLoading(false));
  }, [pr.number, pr.repoFullName]);

  const toggle = (d: ReviewDecision) => setDecided((prev) => prev === d ? null : d);

  const repoShort = pr.repoFullName.split('/')[1] ?? pr.repoFullName;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{
        height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(23,24,28,1)',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
        </svg>
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{repoShort}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
        <span style={{ fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>#{pr.number}</span>
        {diff && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>
            {diff.summary.files} files
          </span>
        )}
      </div>

      {/* PR Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0,
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            #{pr.number}
          </span>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.01em', flex: 1 }}>
            {pr.title}
          </span>
          <button
            onClick={() => window.electronAPI.openExternal(pr.url)}
            style={{
              color: 'rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          fontSize: 12, color: 'rgba(255,255,255,0.45)',
        }}>
          <CIDot ciStatus={pr.ciStatus} />
          {diff?.base && (
            <>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.09)' }} />
              <BranchChip name={diff.base} />
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>←</span>
              <BranchChip name={diff.head ?? ''} />
            </>
          )}
          {diff && (
            <>
              <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.09)' }} />
              <span style={{ fontFamily: 'var(--gh-font-mono, monospace)' }}>
                <span style={{ color: '#7fd49a' }}>+{diff.summary.additions}</span>{' '}
                <span style={{ color: '#e88f8f' }}>−{diff.summary.deletions}</span>{' '}
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>· {diff.summary.files} files</span>
              </span>
            </>
          )}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono, monospace)' }}>
            {pr.author.login}
          </span>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ReviewBtn tone="#6fcf97" active={decided === 'approve'} onClick={() => toggle('approve')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Approve
          </ReviewBtn>
          <ReviewBtn tone="#e98b8b" active={decided === 'reject'} onClick={() => toggle('reject')}>
            Request changes
          </ReviewBtn>
          <ReviewBtn active={decided === 'comment'} onClick={() => toggle('comment')}>
            Comment
          </ReviewBtn>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <CheckoutBtn hasWorktree={hasWorktree} onClick={onCheckout} />
          </span>
        </div>
      </div>

      {/* Diff */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(23,24,28,1)' }}>
        {loading ? (
          <div style={{
            padding: '24px 18px', textAlign: 'center',
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.25)',
          }}>Loading diff…</div>
        ) : diff && diff.files.length > 0 ? (
          <>
            {diff.files.map((f, i) => <FileDiff key={i} file={f} />)}
            <div style={{
              padding: '14px 18px', textAlign: 'center', fontSize: 11,
              color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--gh-font-mono, monospace)',
            }}>~ end of diff ~</div>
          </>
        ) : (
          <div style={{
            padding: '24px 18px', textAlign: 'center',
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12, color: 'rgba(255,255,255,0.25)',
          }}>No diff available</div>
        )}
      </div>
    </>
  );
}
