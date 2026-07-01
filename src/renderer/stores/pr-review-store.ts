import { create } from 'zustand';
import type { PRReviewCommentDraft, PRReviewEvent } from '@shared/types';

export interface ReviewComposeTarget {
  filePath: string;
  side: 'additions' | 'deletions';
  lineNumber: number;
  startLineNumber?: number;
  startSide?: 'additions' | 'deletions';
}

interface PRReviewDraft {
  decision: PRReviewEvent | null;
  summary: string;
  comments: PRReviewCommentDraft[];
  composing: ReviewComposeTarget | null;
  composeText: string;
}

interface PRReviewStore {
  drafts: Record<number, PRReviewDraft>;
  submitting: boolean;
  submitError: string | null;

  getDraft: (prId: number) => PRReviewDraft;
  setDecision: (prId: number, decision: PRReviewEvent | null) => void;
  setSummary: (prId: number, summary: string) => void;
  startCompose: (prId: number, target: ReviewComposeTarget) => void;
  setComposeText: (prId: number, text: string) => void;
  cancelCompose: (prId: number) => void;
  saveCompose: (prId: number) => void;
  removeComment: (prId: number, commentId: string) => void;
  clearDraft: (prId: number) => void;
  submitReview: (prId: number, prNumber: number, repoFullName: string) => Promise<boolean>;
}

const EMPTY_COMMENTS: PRReviewCommentDraft[] = [];

const EMPTY_DRAFT: PRReviewDraft = {
  decision: null,
  summary: '',
  comments: EMPTY_COMMENTS,
  composing: null,
  composeText: '',
};

/** Stable empty defaults for Zustand selectors (never use `?? []` inline). */
export const EMPTY_REVIEW_COMMENTS = EMPTY_COMMENTS;
export const EMPTY_REVIEW_DRAFT = EMPTY_DRAFT;

function cloneEmptyDraft(): PRReviewDraft {
  return {
    decision: null,
    summary: '',
    comments: [],
    composing: null,
    composeText: '',
  };
}

export const usePRReviewStore = create<PRReviewStore>((set, get) => ({
  drafts: {},
  submitting: false,
  submitError: null,

  getDraft: (prId) => get().drafts[prId] ?? EMPTY_DRAFT,

  setDecision: (prId, decision) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [prId]: { ...state.drafts[prId] ?? cloneEmptyDraft(), decision },
      },
      submitError: null,
    }));
  },

  setSummary: (prId, summary) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [prId]: { ...state.drafts[prId] ?? cloneEmptyDraft(), summary },
      },
    }));
  },

  startCompose: (prId, target) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [prId]: {
          ...state.drafts[prId] ?? cloneEmptyDraft(),
          composing: target,
          composeText: '',
        },
      },
    }));
  },

  setComposeText: (prId, text) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [prId]: { ...state.drafts[prId] ?? cloneEmptyDraft(), composeText: text },
      },
    }));
  },

  cancelCompose: (prId) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [prId]: {
          ...state.drafts[prId] ?? cloneEmptyDraft(),
          composing: null,
          composeText: '',
        },
      },
    }));
  },

  saveCompose: (prId) => {
    const draft = get().drafts[prId] ?? cloneEmptyDraft();
    if (!draft.composing || !draft.composeText.trim()) return;

    const comment: PRReviewCommentDraft = {
      id: `${draft.composing.filePath}:${draft.composing.side}:${draft.composing.startLineNumber ?? draft.composing.lineNumber}-${draft.composing.lineNumber}:${Date.now()}`,
      filePath: draft.composing.filePath,
      side: draft.composing.side,
      lineNumber: draft.composing.lineNumber,
      startLineNumber: draft.composing.startLineNumber,
      startSide: draft.composing.startSide,
      body: draft.composeText.trim(),
    };

    set((state) => ({
      drafts: {
        ...state.drafts,
        [prId]: {
          ...draft,
          comments: [
            ...draft.comments.filter((c) => c.id !== comment.id),
            comment,
          ],
          composing: null,
          composeText: '',
        },
      },
    }));
  },

  removeComment: (prId, commentId) => {
    set((state) => {
      const draft = state.drafts[prId] ?? cloneEmptyDraft();
      return {
        drafts: {
          ...state.drafts,
          [prId]: {
            ...draft,
            comments: draft.comments.filter((c) => c.id !== commentId),
          },
        },
      };
    });
  },

  clearDraft: (prId) => {
    set((state) => {
      const { [prId]: _removed, ...drafts } = state.drafts;
      return { drafts, submitError: null };
    });
  },

  submitReview: async (prId, prNumber, repoFullName) => {
    const draft = get().drafts[prId] ?? cloneEmptyDraft();
    if (!draft.decision) {
      set({ submitError: 'Choose approve, request changes, or comment first.' });
      return false;
    }

    set({ submitting: true, submitError: null });
    try {
      const result = await window.electronAPI.submitPRReview({
        prNumber,
        repoFullName,
        event: draft.decision,
        body: draft.summary,
        comments: draft.comments,
      });
      if (!result.success) {
        set({ submitting: false, submitError: result.message });
        return false;
      }
      get().clearDraft(prId);
      set({ submitting: false, submitError: null });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ submitting: false, submitError: message });
      return false;
    }
  },
}));
