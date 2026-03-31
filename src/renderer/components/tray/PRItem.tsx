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

export default function PRItem({ pr, index }: PRItemProps) {
  const handleClick = () => {
    window.electronAPI.openExternal(pr.url);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3 py-2.5 hover:bg-ghv-surface-hover transition-colors
                 cursor-pointer group animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-2.5">
        {/* Author avatar */}
        <img
          src={pr.author.avatarUrl}
          alt={pr.author.login}
          className="w-6 h-6 rounded-sm mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <div className="flex-1 min-w-0 space-y-1">
          {/* Repo + PR number */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xs text-ghv-text-muted font-mono truncate">
              {pr.repoFullName}
            </span>
            <span className="text-2xs text-ghv-accent font-mono font-medium">
              #{pr.number}
            </span>
          </div>

          {/* Title */}
          <div className="text-xs text-ghv-text leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {pr.title}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <PRStatusBadge pr={pr} />

            {/* CI status dot */}
            {pr.ciStatus !== 'unknown' && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  pr.ciStatus === 'success'
                    ? 'bg-ghv-success'
                    : pr.ciStatus === 'failure'
                    ? 'bg-ghv-error'
                    : pr.ciStatus === 'pending'
                    ? 'bg-ghv-warning animate-pulse-dot'
                    : 'bg-ghv-text-muted'
                }`}
                title={`CI: ${pr.ciStatus}`}
              />
            )}

            {/* Mention type */}
            <span className="text-2xs text-ghv-text-muted font-mono">
              {pr.mentionType === 'review_requested'
                ? 'review'
                : pr.mentionType === 'mentioned'
                ? 'mention'
                : 'assigned'}
            </span>

            {/* Time */}
            <span className="text-2xs text-ghv-text-muted ml-auto tabular-nums">
              {timeAgo(pr.updatedAt)}
            </span>
          </div>

          {/* Labels */}
          {pr.labels.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-0.5">
              {pr.labels.slice(0, 3).map((label) => (
                <span
                  key={label.name}
                  className="text-2xs px-1 py-px font-mono border"
                  style={{
                    borderColor: `#${label.color}40`,
                    color: `#${label.color}`,
                    backgroundColor: `#${label.color}10`,
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
