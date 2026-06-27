// settings.jsx — Settings view for the menubar Notifier + the Review app.
// Same cool-dark Style-B theme (reuses CC_THEME tokens). Two sections in a
// left rail: "Notifier" (polling + which notifications + muted repos) and
// "Review app" (which editors show in Open-with, per-root PR visibility, and
// an editable list of the git commands the app runs).

// ---------- reusable controls -------------------------------------------------
const Toggle = ({ on, onChange, disabled }) => (
  <button className="gh-btn" disabled={disabled} onClick={() => onChange(!on)} style={{
    width: 38, height: 22, borderRadius: 999, padding: 2, flex: '0 0 auto',
    background: on ? 'var(--cc-accent)' : 'rgba(255,255,255,0.12)',
    border: '1px solid var(--gh-line-2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start',
    transition: 'background .15s', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'default' : 'pointer',
  }}>
    <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'block',
      boxShadow: '0 1px 2px rgba(0,0,0,0.45)' }} />
  </button>
);

const Segmented = ({ options, value, onChange }) => (
  <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--gh-line-2)', borderRadius: 9, padding: 2, gap: 2, flex: '0 0 auto' }}>
    {options.map(o => {
      const active = value === o.v;
      return (
        <button key={o.v} className="gh-btn" onClick={() => onChange(o.v)} style={{
          height: 24, padding: '0 11px', borderRadius: 7, fontFamily: 'var(--cc-sans)',
          fontSize: 11.5, fontWeight: 500,
          background: active ? 'var(--cc-accent-soft)' : 'transparent',
          color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-3)',
          boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none' }}>
          {o.l}
        </button>
      );
    })}
  </div>
);

const Radio = ({ checked, onChange, disabled }) => (
  <button className="gh-btn" disabled={disabled} onClick={onChange} title="Set as default" style={{
    width: 16, height: 16, borderRadius: '50%', flex: '0 0 auto',
    border: `1.5px solid ${checked ? 'var(--cc-accent)' : 'var(--gh-line-3)'}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer' }}>
    {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cc-accent)' }} />}
  </button>
);

const SettRow = ({ icon, label, sub, control, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
    borderBottom: last ? 'none' : '1px solid var(--gh-line-1)' }}>
    {icon && <span style={{ display: 'inline-flex', color: 'var(--gh-fg-3)', flex: '0 0 auto' }}>{icon}</span>}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--cc-sans)', fontSize: 13, color: 'var(--gh-fg-1)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--gh-fg-3)', lineHeight: 1.4 }}>{sub}</div>}
    </div>
    {control}
  </div>
);

const Group = ({ title, desc, children }) => (
  <div style={{ marginBottom: 26 }}>
    <div style={{ fontFamily: 'var(--cc-sans)', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gh-fg-3)', margin: '0 4px 6px' }}>{title}</div>
    {desc && <div style={{ fontSize: 12, color: 'var(--gh-fg-3)', margin: '0 4px 9px', lineHeight: 1.5 }}>{desc}</div>}
    <div style={{ background: 'var(--gh-bg-2)', border: '1px solid var(--gh-line-1)',
      borderRadius: 12, overflow: 'hidden' }}>{children}</div>
  </div>
);

const CustomBadge = () => (
  <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 9.5, fontWeight: 600,
    padding: '1px 6px', borderRadius: 5, color: 'var(--cc-accent)',
    background: 'var(--cc-accent-soft)', border: '1px solid var(--cc-accent-line)' }}>customized</span>
);

// ---------- git command row (editable) ---------------------------------------
const CommandRow = ({ icon, label, def, value, onChange, onReset, last }) => {
  const custom = value !== def;
  return (
    <div style={{ padding: '11px 16px', borderBottom: last ? 'none' : '1px solid var(--gh-line-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
        <span style={{ display: 'inline-flex', color: 'var(--gh-fg-3)' }}>{icon}</span>
        <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 13, color: 'var(--gh-fg-1)', fontWeight: 500 }}>{label}</span>
        {custom && <CustomBadge />}
        <span style={{ flex: 1 }} />
        {custom && (
          <button className="gh-btn" onClick={onReset} style={{ fontFamily: 'var(--cc-sans)', fontSize: 11.5,
            color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gh-fg-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gh-fg-3)'}>
            <IRefresh size={11} /> Reset
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minHeight: 56,
        background: 'rgba(0,0,0,0.28)', border: `1px solid ${custom ? 'var(--cc-accent-line)' : 'var(--gh-line-2)'}`,
        borderRadius: 8, padding: '9px 10px' }}>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 12.5, color: 'var(--gh-fg-4)', lineHeight: '20px' }}>$</span>
        <textarea value={value} onChange={e => onChange(e.target.value)} spellCheck={false} rows={2} style={{
          flex: 1, background: 'transparent', border: 0, outline: 'none', resize: 'vertical',
          color: 'var(--gh-fg-1)', fontFamily: 'var(--gh-font-mono)', fontSize: 12.5, lineHeight: '20px',
          minHeight: 40, padding: 0 }} />
      </div>
    </div>
  );
};

// ---------- command definitions ----------------------------------------------
const GIT_COMMANDS = [
  { id: 'push',    label: 'Push',            icon: <IUpload size={14} />,     def: 'git push origin HEAD' },
  { id: 'pull',    label: 'Pull',            icon: <IDownload size={14} />,   def: 'git pull --ff-only' },
  { id: 'fetch',   label: 'Fetch',           icon: <IRefresh size={14} />,    def: 'git fetch --all --prune' },
  { id: 'commit',  label: 'Commit',          icon: <IGitCommit size={14} />,  def: 'git commit -m "$MESSAGE"' },
  { id: 'merge',   label: 'Merge main',      icon: <IGitMerge size={14} />,   def: 'git merge origin/main' },
  { id: 'wadd',    label: 'New worktree',    icon: <IFolder size={14} />,     def: 'git worktree add {path} {branch}' },
  { id: 'wremove', label: 'Remove worktree', icon: <ITrash size={14} />,      def: 'git worktree remove {path}' },
  { id: 'bdelete', label: 'Delete branch',   icon: <ITrash size={14} />,      def: 'git branch -D {branch}' },
];

const INTERVALS = [
  { v: '30s', l: '30s' }, { v: '1m', l: '1 min' }, { v: '5m', l: '5 min' },
  { v: '15m', l: '15 min' }, { v: '30m', l: '30 min' }, { v: 'manual', l: 'Manual' },
];

// ---------- sections ----------------------------------------------------------
const NotifierSection = ({ s, set }) => (
  <div style={{ maxWidth: 640 }}>
    <Group title="Polling" desc="How often the menubar notifier checks GitHub for new activity.">
      <SettRow icon={<IClock size={15} />} label="Check for updates"
        sub="Lower intervals feel live but use more API calls."
        control={<Segmented options={INTERVALS} value={s.interval} onChange={v => set('interval', v)} />} />
      <SettRow icon={<ICircle size={15} />} label="Pause on battery saver"
        sub="Stop polling while macOS Low Power Mode is on." last
        control={<Toggle on={s.pauseOnBattery} onChange={v => set('pauseOnBattery', v)} />} />
    </Group>

    <Group title="Notifications" desc="Which events raise a desktop notification.">
      {[
        { k: 'nReview',  label: 'Review requests',       sub: 'Someone requested your review.' },
        { k: 'nAssigned',label: 'PRs assigned to you',   sub: 'A PR was assigned to you.' },
        { k: 'nMentions',label: 'Comments & mentions',   sub: 'You were @-mentioned in a thread.' },
        { k: 'nCI',      label: 'CI status changes',     sub: 'A check passed or failed on your PRs.' },
        { k: 'nSound',   label: 'Play sound',            sub: 'Chime alongside the banner.' },
        { k: 'nBg',      label: 'Only when in background',sub: 'Suppress banners while the app is focused.' },
      ].map((r, i, arr) => (
        <SettRow key={r.k} label={r.label} sub={r.sub} last={i === arr.length - 1}
          control={<Toggle on={s[r.k]} onChange={v => set(r.k, v)} />} />
      ))}
    </Group>

    <Group title="Muted repositories" desc="Skip notifications for specific repos. They still appear in the Review app.">
      {FUSION_ROOTS.map((root, i) => (
        <SettRow key={root.name} icon={<RootGlyph name={root.name} size={20} />}
          label={root.name} sub={root.path} last={i === FUSION_ROOTS.length - 1}
          control={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 11.5,
                color: s.muted[root.name] ? 'var(--gh-fg-2)' : 'var(--gh-fg-4)' }}>
                {s.muted[root.name] ? 'Muted' : 'Notifying'}
              </span>
              <Toggle on={!!s.muted[root.name]}
                onChange={v => set('muted', { ...s.muted, [root.name]: v })} />
            </span>
          } />
      ))}
    </Group>
  </div>
);

const ReviewSection = ({ s, set }) => {
  const enabledCount = editors.filter(e => s.editors[e.key]).length;
  return (
    <div style={{ maxWidth: 640 }}>
      <Group title="Open with" desc="Pick which editors appear in a worktree's Open menu, and the default.">
        {editors.map((ed, i) => {
          const on = s.editors[ed.key];
          const isDefault = s.defaultEditor === ed.key;
          return (
            <SettRow key={ed.key} icon={<EditorGlyph name={ed.key} size={22} />}
              label={ed.label} last={i === editors.length - 1}
              control={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <Radio checked={isDefault} disabled={!on}
                      onChange={() => on && set('defaultEditor', ed.key)} />
                    <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 11.5,
                      color: isDefault ? 'var(--cc-accent)' : 'var(--gh-fg-4)', width: 48 }}>
                      {isDefault ? 'Default' : 'Set default'}
                    </span>
                  </span>
                  <Toggle on={on} disabled={on && enabledCount === 1}
                    onChange={v => {
                      const next = { ...s.editors, [ed.key]: v };
                      set('editors', next);
                      if (!v && isDefault) {
                        const fallback = editors.find(e => next[e.key]);
                        if (fallback) set('defaultEditor', fallback.key);
                      }
                    }} />
                </span>
              } />
          );
        })}
      </Group>

      <Group title="Repositories" desc="Hide the Pull requests section for repos you only use locally.">
        {FUSION_ROOTS.map((root, i) => (
          <SettRow key={root.name} icon={<RootGlyph name={root.name} size={20} />}
            label={root.name} sub={s.showPR[root.name] === false ? 'PR section hidden' : `${root.prs.length} open pull requests`}
            last={i === FUSION_ROOTS.length - 1}
            control={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 11.5, color: 'var(--gh-fg-3)' }}>Show PRs</span>
                <Toggle on={s.showPR[root.name] !== false}
                  onChange={v => set('showPR', { ...s.showPR, [root.name]: v })} />
              </span>
            } />
        ))}
      </Group>

      <Group title="Git commands"
        desc="The exact command the app runs for each action. Edit to use custom flags or a wrapper. Tokens like {branch} and {path} are substituted at run time.">
        {GIT_COMMANDS.map((c, i) => (
          <CommandRow key={c.id} icon={c.icon} label={c.label} def={c.def}
            value={s.commands[c.id] ?? c.def}
            onChange={v => set('commands', { ...s.commands, [c.id]: v })}
            onReset={() => { const next = { ...s.commands }; delete next[c.id]; set('commands', next); }}
            last={i === GIT_COMMANDS.length - 1} />
        ))}
      </Group>
    </div>
  );
};

// ---------- nav + shell -------------------------------------------------------
const NavItem = ({ icon, label, sub, active, onClick }) => (
  <button className="gh-btn" onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 9, textAlign: 'left',
    background: active ? 'var(--cc-accent-soft)' : 'transparent',
    boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none' }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
    <span style={{ width: 28, height: 28, borderRadius: 8, flex: '0 0 auto',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: active ? 'var(--cc-accent-soft)' : 'rgba(255,255,255,0.05)',
      border: '1px solid var(--gh-line-2)', color: active ? 'var(--cc-accent)' : 'var(--gh-fg-3)' }}>{icon}</span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontFamily: 'var(--cc-sans)', fontSize: 13, fontWeight: 600,
        color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)' }}>{label}</span>
      <span style={{ display: 'block', marginTop: 1, fontSize: 11, color: 'var(--gh-fg-4)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</span>
    </span>
  </button>
);

const SettingsApp = () => {
  const [tab, setTab] = React.useState('notifier');
  const [s, setS] = React.useState({
    interval: '5m', pauseOnBattery: true,
    nReview: true, nAssigned: true, nMentions: true, nCI: false, nSound: false, nBg: true,
    muted: { dotfiles: true },
    editors: { cursor: true, claude: true, codex: true, zed: false, terminal: true, finder: true },
    defaultEditor: 'claude',
    showPR: { dotfiles: false },
    commands: {},
  });
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  return (
    <div className="gh" style={{ ...CC_THEME, width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: 'var(--gh-bg-1)', borderRadius: 12,
      border: '1px solid var(--gh-line-2)', boxShadow: 'var(--gh-shadow-window)' }}>
      {/* Title bar */}
      <div style={{ height: 44, flex: '0 0 auto', display: 'grid',
        gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '0 16px', borderBottom: '1px solid var(--gh-line-1)', background: 'var(--gh-bg-2)' }}>
        <span className="gh-traffic"><span className="gh-tl close" /><span className="gh-tl min" /><span className="gh-tl max" /></span>
        <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 13, fontWeight: 600,
          color: 'var(--gh-fg-1)', letterSpacing: '-0.01em' }}>Settings</span>
        <span />
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Nav rail */}
        <div style={{ width: 244, flex: '0 0 auto', padding: 10,
          background: 'var(--gh-bg-2)', borderRight: '1px solid var(--gh-line-1)',
          display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem icon={<IClock size={15} />} label="Notifier" sub="Polling & notifications"
            active={tab === 'notifier'} onClick={() => setTab('notifier')} />
          <NavItem icon={<IGitPullRequest size={15} stroke={1.6} />} label="Review app" sub="Editors, repos, commands"
            active={tab === 'review'} onClick={() => setTab('review')} />
        </div>

        {/* Content */}
        <div className="gh-scroll" style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '22px 26px',
          background: 'var(--gh-bg-1)' }}>
          <div style={{ fontFamily: 'var(--cc-sans)', fontSize: 18, fontWeight: 600,
            color: 'var(--gh-fg-1)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {tab === 'notifier' ? 'Notifier' : 'Review app'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--gh-fg-3)', marginBottom: 22 }}>
            {tab === 'notifier'
              ? 'Control how the menubar notifier polls GitHub and which events alert you.'
              : 'Configure the Open-with editors, per-repo PR visibility, and the git commands the app runs.'}
          </div>
          {tab === 'notifier' ? <NotifierSection s={s} set={set} /> : <ReviewSection s={s} set={set} />}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { SettingsApp });
