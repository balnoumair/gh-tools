import React from 'react';
import type { PullRequest } from '@shared/types';

export default function PRStatusBadge({ pr }: { pr: PullRequest }) {
  const base =
    'text-[10px] font-medium px-1.5 py-[1px] rounded-md border tracking-tight';

  if (pr.isDraft) {
    return (
      <span
        className={base}
        style={{
          color: 'var(--mac-purple)',
          background: 'rgba(184, 159, 224, 0.10)',
          borderColor: 'rgba(184, 159, 224, 0.22)',
        }}
      >
        draft
      </span>
    );
  }

  if (pr.reviewDecision === 'APPROVED') {
    return (
      <span
        className={base}
        style={{
          color: 'var(--mac-green)',
          background: 'rgba(108, 182, 122, 0.10)',
          borderColor: 'rgba(108, 182, 122, 0.22)',
        }}
      >
        approved
      </span>
    );
  }

  if (pr.reviewDecision === 'CHANGES_REQUESTED') {
    return (
      <span
        className={base}
        style={{
          color: 'var(--mac-orange)',
          background: 'rgba(224, 164, 88, 0.10)',
          borderColor: 'rgba(224, 164, 88, 0.22)',
        }}
      >
        changes
      </span>
    );
  }

  return (
    <span
      className={base}
      style={{
        color: 'var(--mac-accent)',
        background: 'var(--mac-accent-soft)',
        borderColor: 'rgba(217, 119, 87, 0.22)',
      }}
    >
      open
    </span>
  );
}
