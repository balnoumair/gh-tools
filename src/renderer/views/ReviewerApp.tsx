import React, { useEffect } from 'react';
import { usePRStore } from '../stores/pr-store';
import { useReviewerStore } from '../stores/reviewer-store';
import ReviewerSidebar from '../components/reviewer/ReviewerSidebar';
import PRHeader from '../components/reviewer/PRHeader';
import DiffView from '../components/reviewer/DiffView';
import TerminalPane from '../components/reviewer/TerminalPane';

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

function NoPRsView({
  isRefreshing,
  onRefresh,
  onAddTerminal,
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
  onAddTerminal: () => void;
}) {
  if (isRefreshing) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 animate-fade-in">
        <span className="gh-mark text-mac-accent w-3 h-3 animate-spark" aria-hidden />
        <span className="text-[12px] text-mac-label-tertiary">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="text-[14px] text-mac-label font-medium tracking-tight">All caught up</div>
        <div className="text-[12px] text-mac-label-tertiary">Nothing waiting on you right now.</div>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onRefresh}
            className="no-drag text-[11px] text-mac-accent hover:text-mac-accent-hover transition-colors"
          >
            Refresh
          </button>
          <span className="text-mac-label-quaternary text-[11px]">·</span>
          <button
            type="button"
            onClick={onAddTerminal}
            className="no-drag text-[11px] text-mac-accent hover:text-mac-accent-hover transition-colors"
          >
            Add terminal
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main reviewer window --------------------------------------------------

export default function ReviewerApp() {
  const { prs, fetchPRs, setPRs, checkAuth, isRefreshing } = usePRStore();
  const {
    activePane,
    selectedPRId,
    selectPR,
    terminalTabs,
    selectedTerminalId,
    selectTerminal,
    addTerminalTab,
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

  // Auto-select first PR once list is loaded (don't override terminal pane)
  useEffect(() => {
    if (activePane === 'terminal') return;
    if (selectedPRId == null && prs.length > 0) {
      selectPR(prs[0].id);
    }
  }, [prs.length, activePane, selectedPRId]);

  const selectedPR = prs.find((p) => p.id === selectedPRId) ?? null;
  const selectedTerminal =
    terminalTabs.find((t) => t.id === selectedTerminalId) ?? null;
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

  const handleAddTerminal = () => {
    void addTerminalTab();
  };

  const renderContent = () => {
    if (activePane === 'terminal' && selectedTerminal) {
      return <TerminalPane tab={selectedTerminal} />;
    }

    if (!selectedPR) {
      if (prs.length === 0) {
        return (
          <NoPRsView
            isRefreshing={isRefreshing}
            onRefresh={() => void fetchPRs()}
            onAddTerminal={handleAddTerminal}
          />
        );
      }
      return (
        <>
          <PaneTitle name="diff" />
          <EmptyState />
        </>
      );
    }

    if (diffEntry?.loading) {
      return (
        <>
          <PaneTitle name={`diff · #${prNum}`} />
          <LoadingState />
        </>
      );
    }

    if (diffEntry?.error) {
      return (
        <>
          <PaneTitle name={`diff · #${prNum}`} />
          <ErrorState message={diffEntry.error} />
        </>
      );
    }

    if (meta && patch) {
      return (
        <>
          <PaneTitle name={`diff · #${prNum}`} extra={`${meta.files} files`} />
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
      );
    }

    return (
      <>
        <PaneTitle name={`diff · #${prNum}`} />
        <EmptyState />
      </>
    );
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--mac-bg-window)' }}
    >
      {/* Title bar — centered title; left inset clears macOS traffic lights */}
      <div className="drag-region flex items-center h-10 shrink-0 pl-[78px] pr-3 border-b border-mac-separator bg-mac-bg-sidebar">
        <div className="flex-1 min-w-0" />
        <span className="text-[12.5px] text-mac-label-secondary shrink-0">Reviewer</span>
        <div className="flex-1 min-w-0 flex justify-end">
          <button
            type="button"
            onClick={() => void fetchPRs()}
            className="no-drag focus:outline-none w-7 h-7 rounded-md text-mac-label-tertiary hover:text-mac-label-secondary inline-flex items-center justify-center text-[14px] cursor-pointer"
            title="Refresh PR list"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ReviewerSidebar
          prs={prs}
          selectedPRId={selectedPRId}
          activePane={activePane}
          onSelectPR={handleSelectPR}
          terminalTabs={terminalTabs}
          selectedTerminalId={selectedTerminalId}
          onSelectTerminal={selectTerminal}
          onAddTerminal={handleAddTerminal}
        />

        <div
          className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(110,196,138,0.18)' }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
