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

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-2.5 hover:bg-mac-fill/50 transition-colors
                 cursor-pointer group animate-fade-in"
    >
      <div className="flex items-start gap-3">
        {/* Author avatar */}
        <img
          src={pr.author.avatarUrl}
          alt={pr.author.login}
          className="w-7 h-7 rounded-full mt-0.5 ring-1 ring-mac-separator"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <div className="flex-1 min-w-0 space-y-1">
          {/* Repo + PR number */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-mac-label-secondary truncate">
              {pr.repoFullName}
            </span>
            <span className="text-[11px] text-mac-primary font-medium">
              #{pr.number}
            </span>
          </div>

          {/* Title */}
          <div className="text-[13px] text-mac-label leading-snug line-clamp-2">
            {pr.title}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <PRStatusBadge pr={pr} />

            {/* CI status dot */}
            {pr.ciStatus !== 'unknown' && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  pr.ciStatus === 'success'
                    ? 'bg-mac-success'
                    : pr.ciStatus === 'failure'
                    ? 'bg-mac-danger'
                    : pr.ciStatus === 'pending'
                    ? 'bg-mac-warning animate-pulse-dot'
                    : 'bg-mac-label-tertiary'
                }`}
                title={`CI: ${pr.ciStatus}`}
              />
            )}

            {/* Mention type */}
            <span className="text-[11px] text-mac-label-tertiary">
              {pr.mentionType === 'review_requested'
                ? 'review'
                : pr.mentionType === 'mentioned'
                ? 'mention'
                : pr.mentionType === 'authored'
                ? 'author'
                : 'assigned'}
            </span>

            {/* Time */}
            <span className="text-[11px] text-mac-label-tertiary ml-auto tabular-nums">
              {timeAgo(pr.updatedAt)}
            </span>
          </div>

          {/* Labels */}
          {pr.labels.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-0.5">
              {pr.labels.slice(0, 3).map((label) => (
                <span
                  key={label.name}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: `#${label.color}`,
                    backgroundColor: `#${label.color}15`,
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
