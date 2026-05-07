import React from 'react';
import type { PullRequest } from '@shared/types';

interface PRItemProps {
  pr: PullRequest;
  index: number;
}

export default function PRItem({ pr }: PRItemProps) {
  const handleClick = () => {
    window.electronAPI.openExternal(pr.url);
  };

  const relationshipLabel =
    pr.mentionType === 'authored' ? 'Your PRs' : 'Review requested';
  const repoName = pr.repoFullName.split('/')[1] ?? pr.repoFullName;

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3.5 py-2.5 border-b border-mac-separator hover:bg-mac-control-hover transition-colors
                 cursor-pointer animate-fade-in focus:outline-none"
    >
      <div className="flex items-start gap-2.5">
        <img
          src={pr.author.avatarUrl}
          alt={pr.author.login}
          className="w-[22px] h-[22px] rounded-full mt-0.5 ring-1 ring-mac-separator-heavy shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-mac-label-tertiary">
            <span className="font-mono truncate">{repoName}</span>
            <span>·</span>
            <span className="font-mono shrink-0">#{pr.number}</span>
            <div className="ml-auto w-2 shrink-0 flex items-center justify-center">
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

          <div className="mt-0.5 text-[13px] font-medium text-mac-label leading-snug line-clamp-2 tracking-tight">
            {pr.title}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[11px] text-mac-label-tertiary px-[7px] py-[1.5px] rounded-full border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'var(--mac-separator)',
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
