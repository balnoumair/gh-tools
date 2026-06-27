import React, { useState } from 'react';
import { usePRStore } from '../../stores/pr-store';
import { filterPRs, getPRsByRepo, type TrayFilter } from './pr-visibility';
import type { PullRequest } from '@shared/types';

function ciDotColor(ciStatus: PullRequest['ciStatus']): string {
  if (ciStatus === 'success') return 'var(--gh-success, #6fcf97)';
  if (ciStatus === 'failure') return 'var(--gh-danger, #e98b8b)';
  if (ciStatus === 'pending') return 'var(--gh-warn, #d9c98a)';
  return 'rgba(255,255,255,0.25)';
}

const STATE_LABEL: Record<PullRequest['mentionType'], string> = {
  review_requested: 'Review',
  authored: 'Yours',
  mentioned: 'Mentioned',
  assigned: 'Assigned',
};

const STATE_COLOR: Record<PullRequest['mentionType'], string> = {
  review_requested: 'var(--gh-info, #8fa6e6)',
  authored: 'rgba(255,255,255,0.55)',
  mentioned: 'var(--gh-warn, #d9c98a)',
  assigned: 'rgba(255,255,255,0.55)',
};

function formatAge(updatedAt: string): string {
  const now = Date.now();
  const diff = now - new Date(updatedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function PRRow({ pr }: { pr: PullRequest }) {
  return (
    <button
      className="w-full text-left"
      onClick={() => window.electronAPI.openExternal(pr.url)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        minHeight: 56, boxSizing: 'border-box',
        margin: '1px 8px', width: 'calc(100% - 16px)',
        padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
        background: 'transparent', border: 'none',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <span
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: ciDotColor(pr.ciStatus), flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11,
            color: 'rgba(255,255,255,0.3)', flexShrink: 0,
          }}>#{pr.number}</span>
          <span style={{
            fontSize: 12.5, color: 'rgba(255,255,255,0.9)', fontWeight: 500,
            lineHeight: 1.32, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{pr.title}</span>
        </div>
        <div style={{
          marginTop: 3, display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10.5,
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span style={{ color: STATE_COLOR[pr.mentionType] }}>
            {STATE_LABEL[pr.mentionType]}
          </span>
          <span>·</span>
          <span>{pr.author.login}</span>
          <span>·</span>
          <span>{formatAge(pr.updatedAt)}</span>
        </div>
      </div>
    </button>
  );
}

function RepoGroup({ repo, prs }: { repo: string; prs: PullRequest[] }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        margin: '6px 10px 2px', padding: '2px 2px',
      }}>
        <span style={{
          width: 17, height: 17, borderRadius: 5,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 9,
          fontWeight: 600, color: 'rgba(255,255,255,0.55)', flexShrink: 0,
        }}>{repo[0]?.toUpperCase()}</span>
        <span style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
        }}>{repo}</span>
        <span style={{
          fontFamily: 'var(--gh-font-mono, monospace)',
          fontSize: 10.5, color: 'rgba(255,255,255,0.3)',
        }}>{prs.length}</span>
      </div>
      {prs.map((pr) => <PRRow key={pr.id} pr={pr} />)}
    </div>
  );
}

function FilterTabs({
  filter, onChange, all, review, yours,
}: {
  filter: TrayFilter;
  onChange: (f: TrayFilter) => void;
  all: number; review: number; yours: number;
}) {
  const tabs: { v: TrayFilter; l: string; c: number }[] = [
    { v: 'all', l: 'All', c: all },
    { v: 'review', l: 'Review', c: review },
    { v: 'yours', l: 'Yours', c: yours },
  ];
  return (
    <div style={{
      display: 'inline-flex', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: 2, gap: 2,
    }}>
      {tabs.map((t) => {
        const active = filter === t.v;
        return (
          <button
            key={t.v}
            onClick={() => onChange(t.v)}
            style={{
              height: 22, padding: '0 9px', borderRadius: 6,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: active ? 'rgba(139,143,240,0.15)' : 'transparent',
              color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              border: active ? '1px solid rgba(139,143,240,0.40)' : '1px solid transparent',
            }}
          >
            {t.l}
            <span style={{
              marginLeft: 5, color: active ? '#8b8ff0' : 'rgba(255,255,255,0.25)',
              fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10,
            }}>{t.c}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function PRList() {
  const { prs, isRefreshing, error } = usePRStore();
  const [filter, setFilter] = useState<TrayFilter>('all');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
        <div className="text-[13px]" style={{ color: '#e98b8b' }}>{error}</div>
        <button
          onClick={() => usePRStore.getState().forceRefresh()}
          className="text-[11px] transition-colors"
          style={{ color: '#8b8ff0' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (isRefreshing && prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  const visible = filterPRs(prs, filter);
  const groups = getPRsByRepo(visible);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter tabs */}
      <div style={{ padding: '0 13px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <FilterTabs
          filter={filter}
          onChange={setFilter}
          all={prs.length}
          review={prs.filter((p) => p.mentionType === 'review_requested').length}
          yours={prs.filter((p) => p.mentionType === 'authored').length}
        />
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
        {groups.length === 0 ? (
          <div style={{
            padding: '28px 14px', textAlign: 'center',
            fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12,
            color: 'rgba(255,255,255,0.25)',
          }}>
            Nothing here — you&apos;re all caught up.
          </div>
        ) : (
          groups.map((g) => <RepoGroup key={g.repo} repo={g.repo} prs={g.prs} />)
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 13px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.18)',
        fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11,
        color: 'rgba(255,255,255,0.25)',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{visible.length} shown</span>
        <span style={{ marginLeft: 'auto' }}>
          Open Review
        </span>
      </div>
    </div>
  );
}
