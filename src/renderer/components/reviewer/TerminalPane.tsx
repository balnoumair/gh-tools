import React, { useState } from 'react';
import type { TerminalTab } from '@shared/types';

interface TerminalPaneProps {
  tab: TerminalTab;
}

export default function TerminalPane({ tab }: TerminalPaneProps) {
  const [status, setStatus] = useState<string | null>(null);

  const openTerminal = async () => {
    setStatus(null);
    const result = await window.electronAPI.openInEditor('terminal', tab.cwd);
    if (!result.success) setStatus(result.message);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div
        className="flex items-center gap-2 shrink-0"
        style={{
          height: 24,
          padding: '0 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          borderBottom: '1px solid var(--mac-separator)',
          background: 'rgba(110,196,138,0.06)',
          color: 'var(--mac-label-secondary)',
        }}
      >
        <span style={{ color: 'var(--mac-green)', fontWeight: 600 }}>1</span>
        <span>{tab.label}</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div
            className="mx-auto w-10 h-10 rounded-lg border border-mac-separator bg-white/[0.035] flex items-center justify-center text-mac-label-secondary"
            aria-hidden
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.5 4.5L6.5 7.5L3.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 11h4.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="text-[14px] text-mac-label font-medium tracking-tight">{tab.label}</div>
            <div className="font-mono text-[11px] text-mac-label-tertiary truncate">{tab.cwd}</div>
          </div>
          <button
            type="button"
            onClick={() => void openTerminal()}
            className="no-drag h-7 px-3 rounded-md text-[12px] font-medium border border-mac-separator-heavy bg-white/[0.06] text-mac-label hover:bg-white/[0.09] transition-colors"
          >
            Open in Terminal
          </button>
          {status && <div className="text-[11px] text-mac-red">{status}</div>}
        </div>
      </div>
    </div>
  );
}
