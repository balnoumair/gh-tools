import React from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function AuthPrompt() {
  const { checkAuth } = usePRStore();

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="w-full max-w-[280px] space-y-4 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <span className="gh-mark text-mac-label-secondary w-7 h-7" aria-hidden />
          <div className="text-center space-y-1.5">
            <div className="text-[15px] font-semibold text-mac-label leading-none tracking-tight">
              Connect GitHub
            </div>
            <div className="text-[12px] text-mac-label-secondary leading-relaxed">
              Run{' '}
              <span className="font-mono text-[11px] text-mac-label bg-mac-control-bg px-1.5 py-0.5 rounded border border-mac-separator-heavy">
                gh auth login
              </span>{' '}
              in your terminal, then retry.
            </div>
          </div>
        </div>

        <button
          onClick={() => checkAuth()}
          className="w-full py-2 text-[13px] font-medium rounded-lg
                     bg-mac-accent text-[#171717]
                     hover:bg-mac-accent-hover active:bg-mac-accent-active
                     transition-colors"
        >
          Retry
        </button>

        <div className="text-[10.5px] text-mac-label-tertiary text-center">
          Requires <span className="font-mono">repo</span> + <span className="font-mono">read:org</span> scopes
        </div>
      </div>
    </div>
  );
}
