import React, { useMemo, useState } from 'react';
import { usePRStore } from '../../stores/pr-store';
import { filterNotifierPRs, filterPRs, getPRsByRepo, type TrayFilter } from './pr-visibility';
import { useNotifierSettings } from '../../hooks/use-notifier-settings';
import type { PullRequest } from '@shared/types';

function ciDotColor(ciStatus: PullRequest['ciStatus']): string {
  if (ciStatus === 'success') return 'var(--gh-success)';
  if (ciStatus === 'failure') return 'var(--gh-danger)';
  if (ciStatus === 'pending') return 'var(--gh-warn)';
  return 'var(--gh-fg-4)';
}

const STATE_LABEL: Record<PullRequest['mentionType'], string> = {
  review_requested: 'Review requested',
  authored: 'Yours',
  mentioned: 'Mentioned',
  assigned: 'Assigned',
};

const STATE_COLOR: Record<PullRequest['mentionType'], string> = {
  review_requested: 'var(--gh-info)',
  authored: 'var(--gh-fg-2)',
  mentioned: 'var(--gh-warn)',
  assigned: 'var(--gh-fg-2)',
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
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--gh-fg-4)', flexShrink: 0,
          }}>#{pr.number}</span>
          <span style={{
            fontSize: 12.5, color: 'var(--gh-fg-1)', fontWeight: 500,
            lineHeight: 1.32, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{pr.title}</span>
        </div>
        <div style={{
          marginTop: 3, display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--font-mono)', fontSize: 10.5,
          color: 'var(--gh-fg-4)',
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
          background: 'var(--gh-bg-3)', border: '1px solid var(--gh-line-2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          fontWeight: 600, color: 'var(--gh-fg-2)', flexShrink: 0,
        }}>{repo[0]?.toUpperCase()}</span>
        <span style={{
          fontFamily: 'inherit',
          fontSize: 12, fontWeight: 600, color: 'var(--gh-fg-2)',
        }}>{repo}</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5, color: 'var(--gh-fg-4)',
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
      border: '1px solid var(--gh-line-2)', borderRadius: 8, padding: 2, gap: 2,
    }}>
      {tabs.map((t) => {
        const active = filter === t.v;
        return (
          <button
            key={t.v}
            onClick={() => onChange(t.v)}
            style={{
              height: 22, padding: '0 9px', borderRadius: 6,
              fontFamily: 'inherit',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: active ? 'var(--cc-accent-soft)' : 'transparent',
              color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-3)',
              boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none',
              border: 'none',
            }}
          >
            {t.l}
            <span style={{
              marginLeft: 5, color: active ? 'var(--cc-accent)' : 'var(--gh-fg-4)',
              fontFamily: 'var(--font-mono)', fontSize: 10,
            }}>{t.c}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function PRList() {
  const { prs, isRefreshing, error } = usePRStore();
  const notifier = useNotifierSettings();
  const [filter, setFilter] = useState<TrayFilter>('all');

  const listedPRs = useMemo(
    () => filterNotifierPRs(prs, notifier),
    [prs, notifier],
  );
  const visible = filterPRs(listedPRs, filter);
  const groups = getPRsByRepo(visible);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
        <div className="text-[13px]" style={{ color: 'var(--gh-danger)' }}>{error}</div>
        <button
          onClick={() => usePRStore.getState().forceRefresh()}
          className="text-[11px] transition-colors"
          style={{ color: 'var(--cc-accent)' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (isRefreshing && prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--gh-fg-3)' }}>
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter tabs */}
      <div style={{ padding: '0 13px 10px' }}>
        <FilterTabs
          filter={filter}
          onChange={setFilter}
          all={listedPRs.length}
          review={listedPRs.filter((p) => p.mentionType === 'review_requested').length}
          yours={listedPRs.filter((p) => p.mentionType === 'authored').length}
        />
      </div>

      {/* List */}
      <div className="gh-scroll" style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--gh-line-1)', paddingBottom: 6 }}>
        {groups.length === 0 ? (
          <div style={{
            padding: '28px 14px', textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--gh-fg-4)',
          }}>
            Nothing here — you&apos;re all caught up.
          </div>
        ) : (
          groups.map((g) => <RepoGroup key={g.repo} repo={g.repo} prs={g.prs} />)
        )}
      </div>
    </div>
  );
}
