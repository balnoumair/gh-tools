import React from 'react';
import type { PullRequest } from '@shared/types';
import PRStatusBadge from './PRStatusBadge';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface PRItemProps {
  pr: PullRequest;
  index: number;
}

export default function PRItem({ pr }: PRItemProps) {
  const handleClick = () => {
    window.electronAPI.openExternal(pr.url);
  };

  const mentionLabel =
    pr.mentionType === 'review_requested'
      ? 'review requested'
      : pr.mentionType === 'mentioned'
      ? 'mentioned you'
      : pr.mentionType === 'authored'
      ? 'authored'
      : 'assigned';

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
            <span className="font-mono text-mac-label-tertiary truncate">
              {pr.repoFullName}
            </span>
            <span className="font-mono text-mac-accent font-medium">
              #{pr.number}
            </span>
            <span className="text-mac-label-tertiary ml-auto tabular-nums shrink-0">
              {timeAgo(pr.updatedAt)}
            </span>
          </div>

          <div className="text-[13px] text-mac-label leading-snug line-clamp-2 tracking-tight">
            {pr.title}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <PRStatusBadge pr={pr} />

            {pr.ciStatus !== 'unknown' && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${
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
            )}

            <span className="text-[11px] text-mac-label-tertiary">
              {mentionLabel}
            </span>
          </div>

          {pr.labels.length > 0 && (
            <div className="flex gap-1 flex-wrap pt-0.5">
              {pr.labels.slice(0, 3).map((label) => (
                <span
                  key={label.name}
                  className="text-[10px] font-medium px-1.5 py-[1px] rounded-md border"
                  style={{
                    color: `#${label.color}`,
                    backgroundColor: `#${label.color}10`,
                    borderColor: `#${label.color}25`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
