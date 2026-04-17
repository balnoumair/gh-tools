import React, { useRef, useEffect } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function OutputPanel() {
  const { outputLog, clearOutput } = useGitStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLog.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-mac-separator shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-mac-label-tertiary font-medium uppercase tracking-[0.10em]">Output</span>
          {outputLog.length > 0 && (
            <span className="text-[10px] text-mac-label-quaternary tabular-nums font-mono">
              {outputLog.length} {outputLog.length === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>
        {outputLog.length > 0 && (
          <button
            onClick={clearOutput}
            className="text-[10.5px] text-mac-label-tertiary hover:text-mac-accent transition-colors px-2 py-0.5 rounded hover:bg-mac-control-hover"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-[1.65]">
        {outputLog.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-mac-label-tertiary text-[14px]">
              Run a git operation to see output here.
            </p>
          </div>
        ) : (
          outputLog.map((line, i) => {
            const lower = line.toLowerCase();
            const isError = lower.includes('failed') || lower.includes('error');
            const isSuccess =
              lower.includes('completed') || lower.includes('merged') || lower.includes('switched');
            return (
              <div
                key={i}
                className={`py-px ${
                  isError ? 'text-mac-red' : isSuccess ? 'text-mac-green' : 'text-mac-label-secondary'
                }`}
              >
                {line}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
