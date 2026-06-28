import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  GIT_COMMAND_DEFS,
  mergeSettings,
  uniqueNotifierRepos,
  type AppSettings,
  type GitCommandId,
  type PollInterval,
} from '@shared/settings';
import { usePRStore } from '../../stores/pr-store';

type SettingsTab = 'notifier' | 'review';

const INTERVALS: { v: PollInterval; l: string }[] = [
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

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!on)}
      style={{
        width: 38, height: 22, borderRadius: 999, padding: 2, flexShrink: 0,
        background: on ? 'var(--cc-accent)' : 'rgba(255,255,255,0.12)',
        border: '1px solid var(--gh-line-2)',
        display: 'inline-flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background .15s', cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
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
      border: '1px solid var(--gh-line-2)', borderRadius: 9, padding: 2, gap: 2, flexShrink: 0,
    }}>
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            height: 24, padding: '0 11px', borderRadius: 7,
            fontFamily: 'inherit', fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
            background: active ? 'var(--cc-accent-soft)' : 'transparent',
            color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-3)',
            boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none',
            border: 'none',
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
      borderBottom: last ? 'none' : '1px solid var(--gh-line-1)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'inherit', fontSize: 13, color: 'var(--gh-fg-1)', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--gh-fg-3)', lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {control}
    </div>
  );
}

function Group({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--gh-fg-3)', margin: '0 4px 6px',
      }}>{title}</div>
      {desc && <div style={{ fontSize: 12, color: 'var(--gh-fg-3)', margin: '0 4px 9px', lineHeight: 1.5 }}>{desc}</div>}
      <div style={{
        background: 'var(--gh-bg-2)', border: '1px solid var(--gh-line-1)',
        borderRadius: 12, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

function CustomBadge() {
  return (
    <span style={{
      fontFamily: 'inherit', fontSize: 9.5, fontWeight: 600,
      padding: '1px 6px', borderRadius: 5, color: 'var(--cc-accent)',
      background: 'var(--cc-accent-soft)', border: '1px solid var(--cc-accent-line)',
    }}>customized</span>
  );
}

function CommandRow({
  label, def, value, onChange, onReset, last,
}: {
  label: string; def: string; value: string;
  onChange: (v: string) => void; onReset: () => void; last?: boolean;
}) {
  const custom = value !== def;
  return (
    <div style={{ padding: '11px 16px', borderBottom: last ? 'none' : '1px solid var(--gh-line-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
        <span style={{ fontFamily: 'inherit', fontSize: 13, color: 'var(--gh-fg-1)', fontWeight: 500 }}>{label}</span>
        {custom && <CustomBadge />}
        <span style={{ flex: 1 }} />
        {custom && (
          <button
            onClick={onReset}
            style={{
              fontFamily: 'inherit', fontSize: 11.5, color: 'var(--gh-fg-3)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gh-fg-1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gh-fg-3)'; }}
          >
            Reset
          </button>
        )}
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, minHeight: 56,
        background: 'rgba(0,0,0,0.28)',
        border: `1px solid ${custom ? 'var(--cc-accent-line)' : 'var(--gh-line-2)'}`,
        borderRadius: 8, padding: '9px 10px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--gh-fg-4)', lineHeight: '20px' }}>$</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={2}
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none', resize: 'vertical',
            color: 'var(--gh-fg-1)', fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: '20px',
            minHeight: 40, padding: 0,
          }}
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, sub, active, onClick }: {
  icon: React.ReactNode; label: string; sub: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 10px', borderRadius: 9, textAlign: 'left', cursor: 'pointer',
      background: active ? 'var(--cc-accent-soft)' : 'transparent',
      boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none',
      border: 'none',
    }}
    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--cc-accent-soft)' : 'rgba(255,255,255,0.05)',
        border: '1px solid var(--gh-line-2)',
        color: active ? 'var(--cc-accent)' : 'var(--gh-fg-3)',
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)',
        }}>{label}</span>
        <span style={{
          display: 'block', marginTop: 1, fontSize: 11, color: 'var(--gh-fg-4)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{sub}</span>
      </span>
    </button>
  );
}

function RepoGlyph({ name }: { name: string }) {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: 5,
      background: 'var(--gh-bg-3)', border: '1px solid var(--gh-line-2)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
      color: 'var(--gh-fg-2)', flexShrink: 0,
    }}>{name[0]?.toUpperCase()}</span>
  );
}

export function SettingsView() {
  const { prs } = usePRStore();
  const [tab, setTab] = useState<SettingsTab>('notifier');
  const [s, setS] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [localRepos, setLocalRepos] = useState<Array<{ name: string; path: string }>>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<Partial<AppSettings>>({});

  const flushSave = useCallback(() => {
    const patch = pendingPatch.current;
    pendingPatch.current = {};
    if (Object.keys(patch).length > 0) {
      void window.electronAPI.settingsSet(patch);
    }
  }, []);

  const queueSave = useCallback((patch: Partial<AppSettings>) => {
    pendingPatch.current = mergeSettings(
      mergeSettings(DEFAULT_SETTINGS, pendingPatch.current),
      patch,
    );
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, 350);
  }, [flushSave]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setS((prev) => {
      const next = mergeSettings(prev, patch);
      queueSave(patch);
      return next;
    });
  }, [queueSave]);

  useEffect(() => {
    void window.electronAPI.settingsGet().then(setS);
    void window.electronAPI.gitLoadRecents().then((recents) => {
      setLocalRepos(recents.map((r) => ({ name: r.name, path: r.path })));
    });
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      flushSave();
    };
  }, [flushSave]);

  const enabledEditorCount = EDITORS.filter((e) => s.review.editors[e.key]).length;
  const notifierRepos = useMemo(() => uniqueNotifierRepos(prs), [prs]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{
          width: 244, flexShrink: 0, padding: 10,
          background: 'var(--gh-bg-2)', borderRight: '1px solid var(--gh-line-1)',
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

        <div className="gh-scroll" style={{
          flex: 1, minWidth: 0, overflowY: 'auto', padding: '22px 26px',
          background: 'var(--gh-bg-1)',
        }}>
          <div style={{
            fontFamily: 'inherit', fontSize: 18, fontWeight: 600,
            color: 'var(--gh-fg-1)', letterSpacing: '-0.02em', marginBottom: 4,
          }}>
            {tab === 'notifier' ? 'Notifier' : 'Review app'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--gh-fg-3)', marginBottom: 22 }}>
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
                    <Segmented<PollInterval>
                      options={INTERVALS}
                      value={s.notifier.interval}
                      onChange={(v) => update({ notifier: { interval: v } })}
                    />
                  }
                />
                <SettRow
                  label="Pause on battery saver"
                  sub="Stop polling while macOS Low Power Mode is on."
                  last
                  control={
                    <Toggle
                      on={s.notifier.pauseOnBattery}
                      onChange={(v) => update({ notifier: { pauseOnBattery: v } })}
                    />
                  }
                />
              </Group>

              <Group title="Notifications" desc="Which events raise a desktop notification.">
                {([
                  { k: 'notifyReview' as const, label: 'Review requests', sub: 'Someone requested your review.' },
                  { k: 'notifyAssigned' as const, label: 'PRs assigned to you', sub: 'A PR was assigned to you.' },
                  { k: 'notifyMentions' as const, label: 'Comments & mentions', sub: 'You were @-mentioned in a thread.' },
                  { k: 'notifyCI' as const, label: 'CI status changes', sub: 'A check passed or failed on your PRs.' },
                  { k: 'notifySound' as const, label: 'Play sound', sub: 'Chime alongside the banner.' },
                  { k: 'notifyOnlyInBackground' as const, label: 'Only when in background', sub: 'Suppress banners while the app is focused.' },
                ]).map((r, i, arr) => (
                  <SettRow key={r.k} label={r.label} sub={r.sub} last={i === arr.length - 1}
                    control={
                      <Toggle
                        on={s.notifier[r.k]}
                        onChange={(v) => update({ notifier: { [r.k]: v } })}
                      />
                    }
                  />
                ))}
              </Group>

              {notifierRepos.length > 0 ? (
                <Group
                  title="Repositories"
                  desc="Repos from your GitHub activity. Mute stops notifications; hide removes them from the menubar popover. Review app is unaffected."
                >
                  {notifierRepos.map((repo, i) => {
                    const muted = !!s.notifier.mutedRepos[repo.fullName];
                    const hidden = !!s.notifier.hiddenRepos[repo.fullName];
                    return (
                      <SettRow
                        key={repo.fullName}
                        label={repo.name}
                        sub={repo.fullName}
                        last={i === notifierRepos.length - 1}
                        control={
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                              <span style={{
                                fontFamily: 'inherit', fontSize: 11.5, width: 34,
                                color: muted ? 'var(--gh-fg-2)' : 'var(--gh-fg-4)', textAlign: 'right',
                              }}>
                                Mute
                              </span>
                              <Toggle
                                on={muted}
                                disabled={hidden}
                                onChange={(v) => update({
                                  notifier: {
                                    mutedRepos: { ...s.notifier.mutedRepos, [repo.fullName]: v },
                                  },
                                })}
                              />
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                              <span style={{
                                fontFamily: 'inherit', fontSize: 11.5, width: 34,
                                color: hidden ? 'var(--gh-fg-2)' : 'var(--gh-fg-4)', textAlign: 'right',
                              }}>
                                Hide
                              </span>
                              <Toggle
                                on={hidden}
                                onChange={(v) => {
                                  const patch: Partial<AppSettings> = {
                                    notifier: {
                                      hiddenRepos: { ...s.notifier.hiddenRepos, [repo.fullName]: v },
                                    },
                                  };
                                  if (v) {
                                    patch.notifier = {
                                      ...patch.notifier,
                                      hiddenRepos: { ...s.notifier.hiddenRepos, [repo.fullName]: true },
                                      mutedRepos: { ...s.notifier.mutedRepos, [repo.fullName]: true },
                                    };
                                  }
                                  update(patch);
                                }}
                              />
                            </span>
                          </span>
                        }
                      />
                    );
                  })}
                </Group>
              ) : (
                <Group title="Repositories" desc="Repos from your GitHub activity appear here once PRs are loaded.">
                  <SettRow
                    label="No GitHub repos yet"
                    sub="Open the menubar popover or refresh to load pull requests."
                    last
                    control={<span />}
                  />
                </Group>
              )}
            </div>
          ) : (
            <div style={{ maxWidth: 640 }}>
              <Group title="Open with" desc="Pick which editors appear in a worktree's Open menu, and the default.">
                {EDITORS.map((ed, i) => {
                  const on = s.review.editors[ed.key] ?? false;
                  const isDefault = s.review.defaultEditor === ed.key;
                  return (
                    <SettRow key={ed.key} label={ed.label} last={i === EDITORS.length - 1}
                      control={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <button
                              onClick={() => on && update({ review: { defaultEditor: ed.key } })}
                              disabled={!on}
                              style={{
                                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                border: `1.5px solid ${isDefault ? 'var(--cc-accent)' : 'var(--gh-line-3)'}`,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                opacity: !on ? 0.35 : 1, cursor: !on ? 'default' : 'pointer',
                                background: 'transparent',
                              }}
                            >
                              {isDefault && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cc-accent)' }} />}
                            </button>
                            <span style={{
                              fontFamily: 'inherit', fontSize: 11.5, width: 60,
                              color: isDefault ? 'var(--cc-accent)' : 'var(--gh-fg-4)',
                            }}>
                              {isDefault ? 'Default' : 'Set default'}
                            </span>
                          </span>
                          <Toggle
                            on={on}
                            disabled={on && enabledEditorCount === 1}
                            onChange={(v) => {
                              const editors = { ...s.review.editors, [ed.key]: v };
                              const patch: Partial<AppSettings> = { review: { editors } };
                              if (!v && isDefault) {
                                const fallback = EDITORS.find((e) => e.key !== ed.key && editors[e.key]);
                                if (fallback) {
                                  patch.review = { ...patch.review, editors, defaultEditor: fallback.key };
                                }
                              }
                              update(patch);
                            }}
                          />
                        </span>
                      }
                    />
                  );
                })}
              </Group>

              {localRepos.length > 0 && (
                <Group title="Local repositories" desc="Repos on disk — control sidebar visibility in the Review app only.">
                  {localRepos.map((repo, i) => (
                    <SettRow
                      key={repo.path}
                      label={repo.name}
                      sub={repo.path}
                      last={i === localRepos.length - 1}
                      control={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                          <RepoGlyph name={repo.name} />
                          <span style={{ fontFamily: 'inherit', fontSize: 11.5, color: 'var(--gh-fg-3)' }}>Show PRs</span>
                          <Toggle
                            on={s.review.showPR[repo.name] !== false}
                            onChange={(v) => update({
                              review: { showPR: { ...s.review.showPR, [repo.name]: v } },
                            })}
                          />
                        </span>
                      }
                    />
                  ))}
                </Group>
              )}

              <Group
                title="Git commands"
                desc="The exact command the app runs for each action. Edit to use custom flags or a wrapper. Tokens like {branch} and {path} are substituted at run time."
              >
                {GIT_COMMAND_DEFS.map((cmd, i) => (
                  <CommandRow
                    key={cmd.id}
                    label={cmd.label}
                    def={cmd.def}
                    value={s.review.commands[cmd.id] ?? cmd.def}
                    onChange={(v) => update({
                      review: { commands: { ...s.review.commands, [cmd.id]: v } },
                    })}
                    onReset={() => {
                      const commands = { ...s.review.commands };
                      delete commands[cmd.id as GitCommandId];
                      update({ review: { commands } });
                    }}
                    last={i === GIT_COMMAND_DEFS.length - 1}
                  />
                ))}
              </Group>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
