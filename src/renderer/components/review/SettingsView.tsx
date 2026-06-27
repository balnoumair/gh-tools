import React, { useState } from 'react';

type SettingsTab = 'notifier' | 'review';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 38, height: 22, borderRadius: 999, padding: 2, flexShrink: 0,
        background: on ? '#8b8ff0' : 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.09)',
        display: 'inline-flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background .15s', cursor: 'pointer',
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.45)',
      }} />
    </button>
  );
}

function Segmented<T extends string>({
  options, value, onChange,
}: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: 2, gap: 2, flexShrink: 0,
    }}>
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            height: 24, padding: '0 11px', borderRadius: 7,
            fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
            background: active ? 'rgba(139,143,240,0.15)' : 'transparent',
            color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)',
            border: active ? '1px solid rgba(139,143,240,0.40)' : '1px solid transparent',
          }}>{o.l}</button>
        );
      })}
    </div>
  );
}

function SettRow({
  label, sub, control, last,
}: { label: string; sub?: string; control: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500,
        }}>{label}</div>
        {sub && <div style={{ marginTop: 2, fontSize: 11.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {control}
    </div>
  );
}

function Group({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)', margin: '0 4px 6px',
      }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 4px 9px', lineHeight: 1.5 }}>{desc}</div>}
      <div style={{
        background: 'rgba(30,32,38,1)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

type Interval = '30s' | '1m' | '5m' | '15m' | '30m' | 'manual';

interface SettState {
  interval: Interval;
  pauseOnBattery: boolean;
  nReview: boolean; nAssigned: boolean; nMentions: boolean; nCI: boolean;
  nSound: boolean; nBg: boolean;
  editors: Record<string, boolean>;
  defaultEditor: string;
}

const INTERVALS: { v: Interval; l: string }[] = [
  { v: '30s', l: '30s' }, { v: '1m', l: '1 min' }, { v: '5m', l: '5 min' },
  { v: '15m', l: '15 min' }, { v: '30m', l: '30 min' }, { v: 'manual', l: 'Manual' },
];

const EDITORS = [
  { key: 'cursor', label: 'Cursor' },
  { key: 'claude', label: 'Claude Code' },
  { key: 'codex', label: 'Codex' },
  { key: 'zed', label: 'Zed' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'finder', label: 'Finder' },
];

function NavItem({ icon, label, sub, active, onClick }: {
  icon: React.ReactNode; label: string; sub: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 10px', borderRadius: 9, textAlign: 'left', cursor: 'pointer',
      background: active ? 'rgba(139,143,240,0.15)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1px rgba(139,143,240,0.40)' : 'none',
      border: 'none',
    }}
    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(139,143,240,0.15)' : 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: active ? '#8b8ff0' : 'rgba(255,255,255,0.4)',
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 13, fontWeight: 600,
          color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)',
        }}>{label}</span>
        <span style={{
          display: 'block', marginTop: 1, fontSize: 11, color: 'rgba(255,255,255,0.3)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{sub}</span>
      </span>
    </button>
  );
}

export function SettingsView() {
  const [tab, setTab] = useState<SettingsTab>('notifier');
  const [s, setS] = useState<SettState>({
    interval: '5m', pauseOnBattery: true,
    nReview: true, nAssigned: true, nMentions: true, nCI: false, nSound: false, nBg: true,
    editors: { cursor: true, claude: true, codex: true, zed: false, terminal: true, finder: true },
    defaultEditor: 'claude',
  });
  const set = <K extends keyof SettState>(k: K, v: SettState[K]) => setS((prev) => ({ ...prev, [k]: v }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Nav rail */}
        <div style={{
          width: 244, flexShrink: 0, padding: 10,
          background: 'rgba(16,17,22,1)', borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <NavItem
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label="Notifier" sub="Polling & notifications"
            active={tab === 'notifier'} onClick={() => setTab('notifier')}
          />
          <NavItem
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
              </svg>
            }
            label="Review app" sub="Editors, repos, commands"
            active={tab === 'review'} onClick={() => setTab('review')}
          />
        </div>

        {/* Content */}
        <div style={{
          flex: 1, minWidth: 0, overflowY: 'auto', padding: '22px 26px',
          background: 'rgba(23,24,28,1)',
        }}>
          <div style={{
            fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 18, fontWeight: 600,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em', marginBottom: 4,
          }}>
            {tab === 'notifier' ? 'Notifier' : 'Review app'}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', marginBottom: 22 }}>
            {tab === 'notifier'
              ? 'Control how the menubar notifier polls GitHub and which events alert you.'
              : 'Configure the Open-with editors, per-repo PR visibility, and the git commands the app runs.'}
          </div>

          {tab === 'notifier' ? (
            <div style={{ maxWidth: 640 }}>
              <Group title="Polling" desc="How often the menubar notifier checks GitHub for new activity.">
                <SettRow
                  label="Check for updates"
                  sub="Lower intervals feel live but use more API calls."
                  control={
                    <Segmented<Interval>
                      options={INTERVALS}
                      value={s.interval}
                      onChange={(v) => set('interval', v)}
                    />
                  }
                />
                <SettRow
                  label="Pause on battery saver"
                  sub="Stop polling while macOS Low Power Mode is on."
                  last
                  control={<Toggle on={s.pauseOnBattery} onChange={(v) => set('pauseOnBattery', v)} />}
                />
              </Group>

              <Group title="Notifications" desc="Which events raise a desktop notification.">
                {[
                  { k: 'nReview' as const, label: 'Review requests', sub: 'Someone requested your review.' },
                  { k: 'nAssigned' as const, label: 'PRs assigned to you', sub: 'A PR was assigned to you.' },
                  { k: 'nMentions' as const, label: 'Comments & mentions', sub: 'You were @-mentioned in a thread.' },
                  { k: 'nCI' as const, label: 'CI status changes', sub: 'A check passed or failed on your PRs.' },
                  { k: 'nSound' as const, label: 'Play sound', sub: 'Chime alongside the banner.' },
                  { k: 'nBg' as const, label: 'Only when in background', sub: 'Suppress banners while the app is focused.' },
                ].map((r, i, arr) => (
                  <SettRow key={r.k} label={r.label} sub={r.sub} last={i === arr.length - 1}
                    control={<Toggle on={s[r.k]} onChange={(v) => set(r.k, v)} />} />
                ))}
              </Group>
            </div>
          ) : (
            <div style={{ maxWidth: 640 }}>
              <Group title="Open with" desc="Pick which editors appear in a worktree's Open menu, and the default.">
                {EDITORS.map((ed, i) => {
                  const on = s.editors[ed.key] ?? false;
                  const isDefault = s.defaultEditor === ed.key;
                  return (
                    <SettRow key={ed.key} label={ed.label} last={i === EDITORS.length - 1}
                      control={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <button
                              onClick={() => on && set('defaultEditor', ed.key)}
                              disabled={!on}
                              style={{
                                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                border: `1.5px solid ${isDefault ? '#8b8ff0' : 'rgba(255,255,255,0.2)'}`,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                opacity: !on ? 0.35 : 1, cursor: !on ? 'default' : 'pointer',
                                background: 'transparent',
                              }}
                            >
                              {isDefault && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b8ff0' }} />}
                            </button>
                            <span style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11.5,
                              color: isDefault ? '#8b8ff0' : 'rgba(255,255,255,0.25)', width: 60,
                            }}>
                              {isDefault ? 'Default' : 'Set default'}
                            </span>
                          </span>
                          <Toggle
                            on={on}
                            onChange={(v) => {
                              const next = { ...s.editors, [ed.key]: v };
                              set('editors', next);
                              if (!v && isDefault) {
                                const fallback = EDITORS.find((e) => next[e.key]);
                                if (fallback) set('defaultEditor', fallback.key);
                              }
                            }}
                          />
                        </span>
                      }
                    />
                  );
                })}
              </Group>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
