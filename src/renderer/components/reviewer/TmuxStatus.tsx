import React, { useState, useEffect } from 'react';
import type { PullRequest, PRDiffMeta } from '@shared/types';

interface TmuxStatusProps {
  pr: PullRequest | undefined;
  meta: PRDiffMeta | undefined;
}

function useTime(): string {
  const [t, setT] = useState(() => fmt());
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 10_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function fmt(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function TmuxStatus({ pr, meta }: TmuxStatusProps) {
  const time = useTime();

  return (
    <div
      className="flex items-stretch shrink-0"
      style={{
        height: 24,
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        borderTop: '1px solid var(--mac-separator-heavy)',
        background: 'var(--mac-bg-sidebar)',
      }}
    >
      {/* Session name */}
      <span
        style={{
          background: 'var(--mac-green)',
          color: '#0a0a0b',
          fontWeight: 700,
          padding: '0 11px',
          display: 'inline-flex',
          alignItems: 'center',
          letterSpacing: '0.01em',
        }}
      >
        PR Pulse
      </span>

      {/* Context */}
      <span
        style={{
          padding: '0 11px',
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--mac-label-tertiary)',
        }}
      >
        {pr ? `#${pr.number} review` : 'no pr selected'}
      </span>

      {/* Right side */}
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'stretch' }}>
        {meta && pr && (
          <span
            style={{
              padding: '0 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--mac-label-tertiary)',
            }}
          >
            <span style={{ color: 'var(--mac-label-secondary)' }}>{meta.head}</span>
            <span style={{ color: '#7fd49a' }}>+{meta.additions}</span>
            <span style={{ color: '#e88f8f' }}>−{meta.deletions}</span>
          </span>
        )}
        <span
          style={{
            background: 'var(--mac-green)',
            color: '#0a0a0b',
            fontWeight: 700,
            padding: '0 11px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {time}
        </span>
      </span>
    </div>
  );
}
