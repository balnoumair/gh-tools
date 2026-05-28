import React from 'react';
import { useGitStore } from '../../stores/git-store';

/**
 * Shown in the narrow workspace body when no project is open. Project picking
 * is handled by the title-bar selector; this is just a prompt + a way to
 * browse for a new repository.
 */
export default function WorkspaceEmptyState() {
  const { selectRepo, recentRepos } = useGitStore();
  const hasRecents = recentRepos.length > 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 text-center bg-mac-bg-content">
      <span className="gh-mark w-7 h-7 text-mac-label-quaternary" aria-hidden />

      <h1 className="mt-4 text-[15px] font-semibold text-mac-label">No project open</h1>
      <p className="mt-1 text-[12px] leading-relaxed text-mac-label-tertiary">
        {hasRecents ? (
          <>Pick a recent project from the selector above, or open another.</>
        ) : (
          <>Open a repository to manage its branches and worktrees.</>
        )}
      </p>

      <button
        type="button"
        onClick={selectRepo}
        className="mt-5 inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-mac-accent text-[#171717] text-[12px] font-medium hover:bg-mac-accent-hover active:bg-mac-accent-active transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M2 4.5a1 1 0 0 1 1-1h3l1.2 1.4H13a1 1 0 0 1 1 1v5.6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5Z"
            strokeLinejoin="round"
          />
        </svg>
        Open repository…
      </button>
    </div>
  );
}
