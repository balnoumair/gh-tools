import { describe, expect, it } from 'vitest';
import { EMPTY_REVIEW_COMMENTS, EMPTY_REVIEW_DRAFT, usePRReviewStore } from '../../src/renderer/stores/pr-review-store';

describe('pr-review-store', () => {
  it('returns stable empty draft and comments for selectors', () => {
    usePRReviewStore.setState({ drafts: {}, submitting: false, submitError: null });

    const draftA = usePRReviewStore.getState().getDraft(42);
    const draftB = usePRReviewStore.getState().getDraft(42);

    expect(draftA).toBe(draftB);
    expect(draftA).toBe(EMPTY_REVIEW_DRAFT);
    expect(draftA.comments).toBe(EMPTY_REVIEW_COMMENTS);
  });
});
