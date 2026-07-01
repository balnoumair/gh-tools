import React from 'react';

function SkeletonFile({ delay = 0 }: { delay?: number }) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      animation: `diff-skeleton-in 0.45s ease-out ${delay}ms both`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: 'rgba(26,26,29,0.94)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span className="diff-skeleton-shimmer" style={{ width: 12, height: 12, borderRadius: 3 }} />
        <span className="diff-skeleton-shimmer" style={{ width: 16, height: 16, borderRadius: 4 }} />
        <span className="diff-skeleton-shimmer" style={{ flex: 1, height: 12, borderRadius: 4, maxWidth: 280 }} />
        <span className="diff-skeleton-shimmer" style={{ width: 36, height: 10, borderRadius: 4 }} />
      </div>
      <div style={{ padding: '12px 14px 14px 92px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="diff-skeleton-shimmer"
            style={{
              height: 10, borderRadius: 4,
              width: `${68 + ((i * 17) % 28)}%`,
              animationDelay: `${delay + 40 + i * 35}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function DiffLoadingSkeleton({ label = 'Loading diff' }: { label?: string }) {
  return (
    <div style={{ padding: '18px 0 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '0 18px 16px',
        fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11.5,
        color: 'rgba(255,255,255,0.35)',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#8b8ff0',
          boxShadow: '0 0 0 0 rgba(139,143,240,0.45)',
          animation: 'diff-pulse-dot 1.4s ease-in-out infinite',
        }} />
        {label}
      </div>
      <SkeletonFile delay={0} />
      <SkeletonFile delay={80} />
      <SkeletonFile delay={160} />
      <style>{`
        @keyframes diff-skeleton-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes diff-pulse-dot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,143,240,0.35); }
          50% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(139,143,240,0); }
        }
        .diff-skeleton-shimmer {
          display: block;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 0%,
            rgba(255,255,255,0.10) 45%,
            rgba(255,255,255,0.04) 90%
          );
          background-size: 220% 100%;
          animation: diff-shimmer 1.35s ease-in-out infinite;
        }
        @keyframes diff-shimmer {
          0% { background-position: 120% 0; }
          100% { background-position: -120% 0; }
        }
      `}</style>
    </div>
  );
}
