import React, { useEffect } from 'react';
import { usePRStore } from '../stores/pr-store';
import { useReviewerStore } from '../stores/reviewer-store';
import ReviewerSidebar from '../components/reviewer/ReviewerSidebar';
import PRHeader from '../components/reviewer/PRHeader';
import DiffView from '../components/reviewer/DiffView';
import TmuxStatus from '../components/reviewer/TmuxStatus';

// ---- Pane title strip (tmux style) ----------------------------------------

function PaneTitle({ name, extra }: { name: string; extra?: string }) {
  return (
    <div
      className="flex items-center gap-2 shrink-0"
      style={{
        height: 24,
        padding: '0 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        borderBottom: '1px solid var(--mac-separator)',
        background: 'rgba(110,196,138,0.06)',
        color: 'var(--mac-label-secondary)',
      }}
    >
      <span style={{ color: 'var(--mac-green)', fontWeight: 600 }}>1</span>
      <span>{name}</span>
      {extra && (
        <span style={{ marginLeft: 'auto', color: 'var(--mac-label-tertiary)' }}>{extra}</span>
      )}
    </div>
  );
}

// ---- Empty / loading / error states ----------------------------------------

function EmptyState() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ color: 'var(--mac-label-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
    >
      select a PR
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="flex-1 flex items-center justify-center gap-3"
      style={{ color: 'var(--mac-label-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
    >
      <span className="animate-pulse-dot" style={{ color: 'var(--mac-green)' }}>●</span>
      loading diff…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ color: 'var(--mac-red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
    >
      {message}
    </div>
  );
}

// ---- Main reviewer window --------------------------------------------------

export default function ReviewerApp() {
  const { prs, fetchPRs, setPRs, checkAuth } = usePRStore();
  const {
    selectedPRId,
    selectPR,
    decisions,
    setDecision,
    reviewBody,
    setReviewBody,
    diffs,
    fetchDiff,
    isSubmittingReview,
    submitReviewError,
    submitCurrentReview,
    clearSubmitError,
  } = useReviewerStore();

  // Bootstrap
  useEffect(() => {
    checkAuth().then(() => fetchPRs());
    const unsub = window.electronAPI.onPRsUpdated(setPRs);
    return unsub;
  }, []);

  // Auto-select first PR once list is loaded
  useEffect(() => {
    if (selectedPRId == null && prs.length > 0) {
      selectPR(prs[0].id);
    }
  }, [prs.length]);

  const selectedPR = prs.find((p) => p.id === selectedPRId) ?? null;
  const diffEntry = selectedPRId != null ? (diffs[selectedPRId] ?? null) : null;

  // Fetch diff when PR is selected and not yet loaded
  useEffect(() => {
    if (selectedPR && !diffEntry) {
      void fetchDiff(selectedPR);
    }
  }, [selectedPRId]);

  const handleSelectPR = (id: number) => {
    selectPR(id);
    clearSubmitError();
    setReviewBody('');
    const pr = prs.find((p) => p.id === id);
    if (pr) void fetchDiff(pr);
  };

  const handleSubmit = () => {
    if (selectedPR) void submitCurrentReview(selectedPR);
  };

  const meta = diffEntry?.meta;
  const patch = diffEntry?.patch;
  const prNum = selectedPR?.number;

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--mac-bg-window)' }}
    >
      {/* Title bar — native traffic lights via hiddenInset; we fill the rest */}
      <div
        className="drag-region flex items-center shrink-0"
        style={{
          height: 40,
          paddingLeft: 72, // leave room for traffic lights (12px×3 + gaps + offset)
          paddingRight: 14,
          borderBottom: '1px solid var(--mac-separator)',
          background: 'var(--mac-bg-sidebar)',
        }}
      >
        <div className="no-drag flex items-center gap-2 flex-1 min-w-0">
          <span style={{ fontSize: 12.5, color: 'var(--mac-label-tertiary)' }}>⌥</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              color: 'var(--mac-label-secondary)',
            }}
          >
            PR Pulse
          </span>
          <span style={{ color: 'var(--mac-label-quaternary)' }}>·</span>
          <span style={{ fontSize: 12.5, color: 'var(--mac-label-tertiary)' }}>reviewer</span>
        </div>

        <div className="no-drag flex items-center gap-1">
          <button
            onClick={() => void fetchPRs()}
            className="focus:outline-none"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              color: 'var(--mac-label-tertiary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              cursor: 'pointer',
            }}
            title="Refresh PR list"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar */}
        <ReviewerSidebar prs={prs} selectedId={selectedPRId} onSelect={handleSelectPR} />

        {/* Right content — active pane (green border per design) */}
        <div
          className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(110,196,138,0.18)' }}
        >
          {!selectedPR ? (
            <>
              <PaneTitle name="diff" />
              <EmptyState />
            </>
          ) : diffEntry?.loading ? (
            <>
              <PaneTitle name={`diff · #${prNum}`} />
              <LoadingState />
            </>
          ) : diffEntry?.error ? (
            <>
              <PaneTitle name={`diff · #${prNum}`} />
              <ErrorState message={diffEntry.error} />
            </>
          ) : meta && patch ? (
            <>
              <PaneTitle
                name={`diff · #${prNum}`}
                extra={`${meta.files} files`}
              />
              <PRHeader
                pr={selectedPR}
                meta={meta}
                decision={decisions[selectedPR.id] ?? null}
                onSetDecision={(d) => setDecision(selectedPR.id, d)}
                reviewBody={reviewBody}
                onSetBody={setReviewBody}
                onSubmit={handleSubmit}
                isSubmitting={isSubmittingReview}
                submitError={submitReviewError}
                onClearError={clearSubmitError}
              />
              <DiffView patch={patch} />
            </>
          ) : (
            <>
              <PaneTitle name={`diff · #${prNum}`} />
              <EmptyState />
            </>
          )}
        </div>
      </div>

      {/* tmux status bar */}
      <TmuxStatus pr={selectedPR ?? undefined} meta={meta} />
    </div>
  );
}
