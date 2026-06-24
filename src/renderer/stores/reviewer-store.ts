import { create } from 'zustand';
import type { PullRequest, PRDiffMeta, ReviewDecision, TerminalTab } from '@shared/types';

interface DiffEntry {
  meta: PRDiffMeta;
  patch: string;
  loading: boolean;
  error: string | null;
}

type ActivePane = 'pr' | 'terminal';

interface ReviewerStore {
  activePane: ActivePane;
  selectedPRId: number | null;
  selectPR: (id: number | null) => void;

  terminalTabs: TerminalTab[];
  selectedTerminalId: string | null;
  selectTerminal: (id: string) => void;
  addTerminalTab: () => Promise<void>;
  removeTerminalTab: (id: string) => void;

  decisions: Record<number, ReviewDecision | null>;
  setDecision: (prId: number, d: ReviewDecision | null) => void;

  reviewBody: string;
  setReviewBody: (body: string) => void;

  diffs: Record<number, DiffEntry>;
  fetchDiff: (pr: PullRequest) => Promise<void>;

  isSubmittingReview: boolean;
  submitReviewError: string | null;
  submitCurrentReview: (pr: PullRequest) => Promise<void>;
  clearSubmitError: () => void;
}

export const useReviewerStore = create<ReviewerStore>((set, get) => ({
  activePane: 'pr',
  selectedPRId: null,
  selectPR: (id) => set({ activePane: 'pr', selectedPRId: id, selectedTerminalId: null }),

  terminalTabs: [],
  selectedTerminalId: null,
  selectTerminal: (id) => set({ activePane: 'terminal', selectedTerminalId: id }),
  addTerminalTab: async () => {
    const cwd = await window.electronAPI.getHomedir();
    const { terminalTabs } = get();
    const tab: TerminalTab = {
      id: crypto.randomUUID(),
      label: `terminal ${terminalTabs.length + 1}`,
      cwd,
    };
    set({
      terminalTabs: [...terminalTabs, tab],
      activePane: 'terminal',
      selectedTerminalId: tab.id,
      selectedPRId: null,
    });
  },
  removeTerminalTab: (id) => {
    const { terminalTabs, selectedTerminalId, activePane } = get();
    const next = terminalTabs.filter((t) => t.id !== id);
    const removedSelected = selectedTerminalId === id;
    set({
      terminalTabs: next,
      selectedTerminalId: removedSelected ? (next[0]?.id ?? null) : selectedTerminalId,
      activePane:
        removedSelected && activePane === 'terminal'
          ? next.length > 0
            ? 'terminal'
            : 'pr'
          : activePane,
    });
  },

  decisions: {},
  setDecision: (prId, d) =>
    set((s) => ({ decisions: { ...s.decisions, [prId]: d } })),

  reviewBody: '',
  setReviewBody: (reviewBody) => set({ reviewBody }),

  diffs: {},
  fetchDiff: async (pr) => {
    const { diffs } = get();
    if (diffs[pr.id]?.loading || (diffs[pr.id]?.patch && !diffs[pr.id]?.error)) return;

    set((s) => ({
      diffs: {
        ...s.diffs,
        [pr.id]: { meta: {} as PRDiffMeta, patch: '', loading: true, error: null },
      },
    }));

    try {
      const result = await window.electronAPI.getPRDiff(pr.repoFullName, pr.number);
      set((s) => ({
        diffs: {
          ...s.diffs,
          [pr.id]: { ...result, loading: false, error: null },
        },
      }));
    } catch (err) {
      set((s) => ({
        diffs: {
          ...s.diffs,
          [pr.id]: {
            meta: {} as PRDiffMeta,
            patch: '',
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load diff',
          },
        },
      }));
    }
  },

  isSubmittingReview: false,
  submitReviewError: null,
  clearSubmitError: () => set({ submitReviewError: null }),

  submitCurrentReview: async (pr) => {
    const { decisions, reviewBody } = get();
    const decision = decisions[pr.id];
    if (!decision) return;

    set({ isSubmittingReview: true, submitReviewError: null });
    try {
      const body = decision !== 'approve' ? reviewBody : undefined;
      await window.electronAPI.submitReview(pr.repoFullName, pr.number, decision, body);
      set({ isSubmittingReview: false, reviewBody: '' });
    } catch (err) {
      set({
        isSubmittingReview: false,
        submitReviewError: err instanceof Error ? err.message : 'Failed to submit review',
      });
    }
  },
}));
