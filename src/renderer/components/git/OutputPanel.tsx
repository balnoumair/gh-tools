import React, { useRef, useEffect } from 'react';
import { useGitStore } from '../../stores/git-store';

export default function OutputPanel() {
  const { outputLog, clearOutput } = useGitStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLog.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-ghv-bg">
      <div className="flex items-center justify-between px-3 py-1 border-b border-ghv-border shrink-0">
        <span className="text-2xs text-ghv-text-muted uppercase tracking-wider">Output</span>
        {outputLog.length > 0 && (
          <button
            onClick={clearOutput}
            className="text-2xs text-ghv-text-muted hover:text-ghv-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-2xs">
        {outputLog.length === 0 ? (
          <p className="text-ghv-text-muted">No output yet. Run a git operation to see results here.</p>
        ) : (
          outputLog.map((line, i) => {
            const isError = line.toLowerCase().includes('failed') || line.toLowerCase().includes('error');
            const isSuccess = line.toLowerCase().includes('completed') || line.toLowerCase().includes('merged') || line.toLowerCase().includes('switched');
            return (
              <div
                key={i}
                className={`py-0.5 leading-relaxed ${
                  isError ? 'text-ghv-error' : isSuccess ? 'text-ghv-success' : 'text-ghv-text-dim'
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
