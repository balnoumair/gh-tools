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
            <div className="text-[15px] font-semibold leading-none tracking-tight" style={{ color: 'var(--gh-fg-1)' }}>
              Connect GitHub
            </div>
            <div className="text-[12px] leading-relaxed" style={{ color: 'var(--gh-fg-2)' }}>
              Run{' '}
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded border"
                style={{ color: 'var(--gh-fg-1)', background: 'rgba(255,255,255,0.04)', borderColor: 'var(--gh-line-2)' }}>
                gh auth login
              </span>{' '}
              in your terminal, then retry.
            </div>
          </div>
        </div>

        <button
          onClick={() => checkAuth()}
          className="w-full py-2 text-[13px] font-medium rounded-lg transition-colors"
          style={{ background: 'var(--cc-accent)', color: '#0e0f14' }}
        >
          Retry
        </button>

        <div className="text-[10.5px] text-center" style={{ color: 'var(--gh-fg-3)' }}>
          Requires <span className="font-mono">repo</span> + <span className="font-mono">read:org</span> scopes
        </div>
      </div>
    </div>
  );
}
