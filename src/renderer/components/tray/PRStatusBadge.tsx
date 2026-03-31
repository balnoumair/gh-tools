import React from 'react';
import type { PullRequest } from '@shared/types';

interface PRStatusBadgeProps {
  pr: PullRequest;
}

export default function PRStatusBadge({ pr }: PRStatusBadgeProps) {
  if (pr.isDraft) {
    return (
      <span className="text-2xs font-mono px-1.5 py-px bg-ghv-draft/15 text-ghv-draft border border-ghv-draft/30">
        draft
      </span>
    );
  }

  if (pr.reviewDecision === 'APPROVED') {
    return (
      <span className="text-2xs font-mono px-1.5 py-px bg-ghv-success/15 text-ghv-success border border-ghv-success/30">
        approved
      </span>
    );
  }

  if (pr.reviewDecision === 'CHANGES_REQUESTED') {
    return (
      <span className="text-2xs font-mono px-1.5 py-px bg-ghv-warning/15 text-ghv-warning border border-ghv-warning/30">
        changes
      </span>
    );
  }

  return (
    <span className="text-2xs font-mono px-1.5 py-px bg-ghv-accent/10 text-ghv-accent border border-ghv-accent/20">
      open
    </span>
  );
}
