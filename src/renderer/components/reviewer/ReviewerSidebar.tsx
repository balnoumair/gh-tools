import React from 'react';
import type { PullRequest, TerminalTab } from '@shared/types';

// ---- Group header (tmux pane-divider style) --------------------------------

interface GroupHeaderProps {
  label: string;
  count: number;
}

function GroupHeader({ label, count }: GroupHeaderProps) {
  return (
    <div
      className="flex items-center gap-1.5 h-[22px] shrink-0 px-3"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--mac-label-quaternary)',
        background: 'rgba(0,0,0,0.22)',
        borderTop: '1px solid var(--mac-separator)',
        borderBottom: '1px solid var(--mac-separator)',
      }}
    >
      <span style={{ color: 'var(--mac-label-quaternary)' }}>─</span>
      <span style={{ color: 'var(--mac-label-tertiary)' }}>{label}</span>
      <span style={{ color: 'var(--mac-label-quaternary)' }}>{count}</span>
    </div>
  );
}

// ---- CI dot ----------------------------------------------------------------

const CI_DOT_CLASS: Record<string, string> = {
  success: 'bg-mac-green',
  failure: 'bg-mac-red',
  pending: 'bg-mac-orange animate-pulse-dot',
};

function CiDot({ status }: { status: string }) {
  return (
    <span
      className={`w-2 h-2 rounded-full shrink-0 inline-block ${CI_DOT_CLASS[status] ?? 'bg-mac-label-quaternary'}`}
    />
  );
}

// ---- PR row ----------------------------------------------------------------

interface PRListRowProps {
  pr: PullRequest;
  active: boolean;
  onClick: () => void;
}

function PRListRow({ pr, active, onClick }: PRListRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-2.5 shrink-0 px-3 py-0 focus:outline-none"
      style={{
        height: 68,
        borderLeft: `2px solid ${active ? 'var(--mac-label-secondary)' : 'transparent'}`,
        background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderBottom: '1px solid var(--mac-separator)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <CiDot status={pr.ciStatus} />
      <div className="flex-1 min-w-0">
        <div
          className="leading-snug"
          style={{
            fontSize: 12.5,
            fontWeight: active ? 600 : 500,
            color: active ? 'var(--mac-label)' : 'var(--mac-label-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {pr.title}
        </div>
      </div>
    </button>
  );
}

// ---- Terminal row ----------------------------------------------------------

interface TerminalRowProps {
  tab: TerminalTab;
  active: boolean;
  onClick: () => void;
}

function TerminalRow({ tab, active, onClick }: TerminalRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-2.5 shrink-0 px-3 focus:outline-none"
      style={{
        height: 40,
        borderLeft: `2px solid ${active ? 'var(--mac-green)' : 'transparent'}`,
        background: active ? 'rgba(110,196,138,0.08)' : 'transparent',
        borderBottom: '1px solid var(--mac-separator)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <span className="text-mac-label-tertiary shrink-0" aria-hidden>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3.5 4.5L6.5 7.5L3.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 11h4.5" strokeLinecap="round" />
        </svg>
      </span>
      <span
        className="flex-1 min-w-0 truncate"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: active ? 600 : 500,
          color: active ? 'var(--mac-label)' : 'var(--mac-label-secondary)',
        }}
      >
        {tab.label}
      </span>
    </button>
  );
}

// ---- Grouped sidebar -------------------------------------------------------

interface ReviewerSidebarProps {
  prs: PullRequest[];
  selectedPRId: number | null;
  activePane: 'pr' | 'terminal';
  onSelectPR: (id: number) => void;
  terminalTabs: TerminalTab[];
  selectedTerminalId: string | null;
  onSelectTerminal: (id: string) => void;
  onAddTerminal: () => void;
}

export default function ReviewerSidebar({
  prs,
  selectedPRId,
  activePane,
  onSelectPR,
  terminalTabs,
  selectedTerminalId,
  onSelectTerminal,
  onAddTerminal,
}: ReviewerSidebarProps) {
  const order: string[] = [];
  const byRepo: Record<string, PullRequest[]> = {};
  for (const pr of prs) {
    if (!byRepo[pr.repoFullName]) {
      byRepo[pr.repoFullName] = [];
      order.push(pr.repoFullName);
    }
    byRepo[pr.repoFullName].push(pr);
  }

  return (
    <div
      className="flex flex-col shrink-0 overflow-hidden"
      style={{
        width: 300,
        background: 'var(--mac-bg-sidebar)',
        borderRight: '1px solid var(--mac-separator-heavy)',
      }}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <GroupHeader label="open prs" count={prs.length} />
        {order.length === 0 ? (
          <div
            className="px-4 py-5 text-center"
            style={{ fontSize: 12, color: 'var(--mac-label-tertiary)' }}
          >
            All caught up
          </div>
        ) : (
          order.map((repo) => {
            const repoShort = repo.split('/')[1] ?? repo;
            const repoPRs = byRepo[repo];
            return (
              <div key={repo}>
                <GroupHeader label={repoShort} count={repoPRs.length} />
                {repoPRs.map((pr) => (
                  <PRListRow
                    key={pr.id}
                    pr={pr}
                    active={activePane === 'pr' && pr.id === selectedPRId}
                    onClick={() => onSelectPR(pr.id)}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-mac-separator-heavy">
        <GroupHeader label="terminal" count={terminalTabs.length} />
        {terminalTabs.map((tab) => (
          <TerminalRow
            key={tab.id}
            tab={tab}
            active={activePane === 'terminal' && tab.id === selectedTerminalId}
            onClick={() => onSelectTerminal(tab.id)}
          />
        ))}
        <button
          type="button"
          onClick={onAddTerminal}
          className="no-drag w-full text-left flex items-center gap-2 px-3 h-9 text-[12px] text-mac-label-tertiary hover:text-mac-label-secondary hover:bg-white/[0.03] transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span className="text-mac-label-quaternary">+</span>
          <span>terminal</span>
        </button>
      </div>
    </div>
  );
}
