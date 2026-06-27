import React from 'react';
import { usePRStore } from '../../stores/pr-store';

function GitPRIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}

function RefreshIcon({ size = 14, spinning }: { size?: number; spinning?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={spinning ? 'animate-spin' : ''}>
      <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L4 7m16 10l-1.64-1.36A9 9 0 0 1 3.51 15"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TrayHeader() {
  const { prs, isRefreshing, forceRefresh } = usePRStore();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '12px 13px 10px',
    }}>
      {/* CCMenuMark — indigo rounded square with PR icon */}
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        background: 'rgba(139,143,240,0.15)',
        border: '1px solid rgba(139,143,240,0.40)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#8b8ff0', flexShrink: 0,
      }}>
        <GitPRIcon size={12} />
      </span>

      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.92)',
        letterSpacing: '-0.01em',
      }}>
        Pull requests
      </span>

      <span style={{
        fontFamily: 'var(--gh-font-mono, monospace)',
        fontSize: 11, color: 'rgba(255,255,255,0.3)',
      }}>
        {prs.length}
      </span>

      <button
        onClick={forceRefresh}
        disabled={isRefreshing}
        style={{
          marginLeft: 'auto', width: 26, height: 26, borderRadius: 7,
          color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', opacity: isRefreshing ? 0.4 : 1,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        title="Refresh"
      >
        <RefreshIcon size={14} spinning={isRefreshing} />
      </button>
    </div>
  );
}
