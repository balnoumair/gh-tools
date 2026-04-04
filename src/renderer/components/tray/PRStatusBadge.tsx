import React from 'react';
import type { PullRequest } from '@shared/types';

interface PRStatusBadgeProps {
  pr: PullRequest;
}

export default function PRStatusBadge({ pr }: PRStatusBadgeProps) {
  if (pr.isDraft) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mac-purple/15 text-mac-purple">
        draft
      </span>
    );
  }

  if (pr.reviewDecision === 'APPROVED') {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mac-success/15 text-mac-success">
        approved
      </span>
    );
  }

  if (pr.reviewDecision === 'CHANGES_REQUESTED') {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mac-warning/15 text-mac-warning">
        changes
      </span>
    );
  }

  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mac-primary/12 text-mac-primary">
      open
    </span>
  );
}
