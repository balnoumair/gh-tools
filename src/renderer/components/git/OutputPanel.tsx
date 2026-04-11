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
      <div className="flex items-center justify-between px-3 py-[3px] border-b border-mac-separator-heavy shrink-0">
        <span className="text-[11px] text-mac-label-secondary font-semibold uppercase tracking-wide">Output</span>
        {outputLog.length > 0 && (
          <button
            onClick={clearOutput}
            className="text-[11px] text-mac-label-tertiary hover:text-mac-label-secondary transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-[1.6]">
        {outputLog.length === 0 ? (
          <p className="text-mac-label-tertiary">No output yet. Run a git operation to see results here.</p>
        ) : (
          outputLog.map((line, i) => {
            const isError = line.toLowerCase().includes('failed') || line.toLowerCase().includes('error');
            const isSuccess = line.toLowerCase().includes('completed') || line.toLowerCase().includes('merged') || line.toLowerCase().includes('switched');
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
