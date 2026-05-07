import React from 'react';
import type { PullRequest } from '@shared/types';
import PRStatusBadge from './PRStatusBadge';

interface PRItemProps {
  pr: PullRequest;
  index: number;
}

export default function PRItem({ pr }: PRItemProps) {
  const handleClick = () => {
    window.electronAPI.openExternal(pr.url);
  };

  const relationshipLabel =
    pr.mentionType === 'review_requested'
      ? 'Review requested'
      : pr.mentionType === 'authored'
      ? 'Your PRs'
      : 'Review requested';

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-3 hover:bg-mac-control-hover transition-colors
                 cursor-pointer group animate-fade-in relative"
    >
      {/* coral accent rail on hover */}
      <span className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full bg-mac-accent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start gap-3">
        <img
          src={pr.author.avatarUrl}
          alt={pr.author.login}
          className="w-7 h-7 rounded-full mt-0.5 ring-1 ring-mac-separator-heavy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="font-mono text-mac-label-tertiary truncate">
                {pr.repoFullName}
              </span>
              <span className="font-mono text-mac-accent font-medium shrink-0">
                #{pr.number}
              </span>
            </div>
            <div className="w-2 shrink-0 flex items-center justify-center">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block align-middle relative top-[-0.5px] ${
                  pr.ciStatus === 'success'
                    ? 'bg-mac-green'
                    : pr.ciStatus === 'failure'
                    ? 'bg-mac-red'
                    : pr.ciStatus === 'pending'
                    ? 'bg-mac-orange animate-pulse-dot'
                    : 'bg-mac-label-tertiary'
                }`}
                title={`CI: ${pr.ciStatus}`}
              />
            </div>
          </div>

          <div className="text-[13px] text-mac-label leading-snug line-clamp-2 tracking-tight">
            {pr.title}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <PRStatusBadge pr={pr} />
            <span
              className="text-[11px] text-mac-label-secondary px-2 py-[1px] rounded-full border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {relationshipLabel}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
