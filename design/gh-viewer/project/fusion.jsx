// fusion.jsx — "Review" app: a fusion of the desktop reviewer and the repo
// workspace. Worktrees are a single FLAT list (the main repo lives there too,
// so they're ungrouped); PULL REQUESTS are grouped by repo. Select a PR → its
// diff + review actions (incl. "checkout as worktree"). Select a worktree →
// a PR-style diff plus branch/worktree management. No terminal.

// ---------------------------------------------------------------------------
const linkedPrForBranch = (branch) =>
  SAMPLE_PRS.find(p => {
    const d = getDiff(p.num);
    return d && d.head === branch;
  });

const FUSION_ROOTS = [
  {
    name: 'gh-viewer', path: '~/Projects/gh-viewer', dirty: true,
    worktrees: SAMPLE_WORKTREES.map(w => ({ ...w })),
    prs: SAMPLE_PRS.filter(p => p.repo === 'noumair/gh-viewer'),
  },
  {
    name: 'mtg-builder', path: '~/Projects/mtg-builder', dirty: false,
    worktrees: [
      { path: '~/Projects/mtg-builder', branch: 'main', dirty: false, primary: true, ahead: 0, behind: 0 },
      { path: '~/Projects/mtg-builder-stash', branch: 'refactor/stash-context', dirty: true, primary: false, ahead: 9, behind: 2 },
    ],
    prs: SAMPLE_PRS.filter(p => p.repo === 'noumair/mtg-builder'),
  },
  {
    name: 'dotfiles', path: '~/.config/dotfiles', dirty: false,
    worktrees: [
      { path: '~/.config/dotfiles', branch: 'main', dirty: false, primary: true, ahead: 0, behind: 0 },
    ],
    prs: SAMPLE_PRS.filter(p => p.repo === 'noumair/dotfiles'),
  },
];

const wtId = (rootName, path) => `${rootName}:${path}`;
const repoToRoot = (repo) => repo.split('/')[1];

// ---------------------------------------------------------------------------
const RootGlyph = ({ name, size = 18 }) => (
  <span style={{
    width: size, height: size, borderRadius: 5,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--gh-line-2)',
    color: 'var(--gh-fg-2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--gh-font-mono)', fontSize: Math.round(size * 0.5),
    fontWeight: 600, lineHeight: 1, flex: '0 0 auto',
  }}>{name[0]}</span>
);

// Root header — collapsible group per local repo, with a "+" to add a worktree.
const RootHeader = ({ root, open, onToggle, onNewWorktree }) => (
  <div role="button" onClick={onToggle} style={{
    position: 'sticky', top: 0, zIndex: 2, cursor: 'pointer',
    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
    padding: '9px 11px',
    background: 'rgba(20,20,23,0.96)', backdropFilter: 'blur(8px)',
    borderTop: '1px solid var(--gh-line-2)', borderBottom: '1px solid var(--gh-line-1)',
  }}>
    <span style={{ display: 'inline-flex', color: 'var(--gh-fg-4)',
      transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}>
      <IChevD size={11} stroke={2} />
    </span>
    <RootGlyph name={root.name} size={20} />
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gh-fg-1)', flex: 1, minWidth: 0,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{root.name}</span>
    {root.dirty && <span className="gh-dot warn" style={{ width: 6, height: 6 }} />}
    <button className="gh-btn" title="New worktree" onClick={(e) => { e.stopPropagation(); onNewWorktree(root.name); }}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18, borderRadius: 4, color: 'var(--gh-fg-3)', border: '1px solid var(--gh-line-2)' }}>
      <IPlus size={10} />
    </button>
  </div>
);

// Collapsible label that separates PRs from the worktrees above — can be hidden.
const RowGroupLabel = ({ icon, label, count, open, onToggle }) => (
  <div role="button" onClick={onToggle} style={{ cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '6px 11px 6px 13px',
    fontFamily: 'var(--gh-font-mono)', fontSize: 9.5,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gh-fg-4)',
    background: 'rgba(0,0,0,0.14)', borderBottom: '1px solid var(--gh-line-1)' }}>
    <span style={{ display: 'inline-flex', color: 'var(--gh-fg-4)',
      transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}>
      <IChevD size={8} stroke={2} />
    </span>
    {icon}
    <span>{label}</span>
    {count != null && <span>{count}</span>}
  </div>
);

// Worktree row — listed directly inside its root (no separate grouping).
const WtRow = ({ w, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8, minHeight: 50, flex: '0 0 auto',
    padding: '7px 12px 7px 13px', cursor: 'pointer',
    borderLeft: `2px solid ${active ? 'var(--gh-fg-2)' : 'transparent'}`,
    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderBottom: '1px solid var(--gh-line-1)',
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
    <IFolder size={13} style={{ color: 'var(--gh-fg-4)', flex: '0 0 auto' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 12,
          color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.branch}</span>
        {w.primary && <span style={{ fontSize: 8.5, padding: '1px 4px', borderRadius: 3,
          background: 'rgba(255,255,255,0.06)', color: 'var(--gh-fg-3)', letterSpacing: '0.04em',
          textTransform: 'uppercase', fontWeight: 700, flex: '0 0 auto' }}>main</span>}
      </div>
      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, color: 'var(--gh-fg-4)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span className={`gh-dot ${w.dirty ? 'warn' : 'ok'}`} style={{ width: 5, height: 5 }} />
          {w.dirty ? 'modified' : 'clean'}
        </span>
        <span>↑{w.ahead} ↓{w.behind}</span>
      </div>
    </div>
  </div>
);

const PrRow = ({ pr, active, onClick }) => {
  const ci = ciMeta[pr.ci] || ciMeta.idle;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, minHeight: 56, flex: '0 0 auto',
      padding: '9px 12px 9px 13px', cursor: 'pointer',
      borderLeft: `2px solid ${active ? 'var(--gh-fg-2)' : 'transparent'}`,
      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      borderBottom: '1px solid var(--gh-line-1)',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <span className={`gh-dot ${ci.dot}`} style={{ marginTop: 5 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 11, color: 'var(--gh-fg-4)',
            flex: '0 0 auto' }}>#{pr.num}</span>
          <span style={{ fontSize: 12.5, color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)',
            fontWeight: active ? 600 : 500, lineHeight: 1.32,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {pr.title}
          </span>
        </div>
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, color: 'var(--gh-fg-4)' }}>
          <span style={{ color: stateBadge[pr.state]?.tone || 'var(--gh-fg-3)' }}>{pr.state}</span>
          <span>·</span>
          <span>{pr.author}</span>
          <span>·</span>
          <span>{pr.age}</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sidebar — one group per local root; each lists its worktrees then its PRs.
const FusionSidebar = ({ roots, view, onSelect, onNewWorktree }) => {
  const [openRoot, setOpenRoot] = React.useState(() =>
    Object.fromEntries(roots.map(r => [r.name, true])));
  const [prHidden, setPrHidden] = React.useState({});
  const prOpen = (name) => !prHidden[name];

  return (
    <div style={{ width: 320, flex: '0 0 auto', display: 'flex', flexDirection: 'column',
      background: 'var(--gh-bg-2)', borderRight: '1px solid var(--gh-line-2)' }}>
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {roots.map(root => {
          const open = openRoot[root.name];
          return (
            <div key={root.name}>
              <RootHeader root={root} open={open} onNewWorktree={onNewWorktree}
                onToggle={() => setOpenRoot(o => ({ ...o, [root.name]: !o[root.name] }))} />
              {open && (
                <>
                  {/* Worktrees — listed directly, no sub-dropdown */}
                  {root.worktrees.map(w => {
                    const id = wtId(root.name, w.path);
                    return (
                      <WtRow key={id} w={w}
                        active={view.type === 'wt' && view.id === id}
                        onClick={() => onSelect({ type: 'wt', id })} />
                    );
                  })}
                  {/* Pull requests — collapsible */}
                  <RowGroupLabel icon={<IGitPullRequest size={10} stroke={1.6} style={{ color: 'var(--gh-fg-4)' }} />}
                    label="Pull requests" count={root.prs.length}
                    open={prOpen(root.name)}
                    onToggle={() => setPrHidden(h => ({ ...h, [root.name]: !h[root.name] }))} />
                  {prOpen(root.name) && root.prs.map(pr => (
                    <PrRow key={pr.id} pr={pr}
                      active={view.type === 'pr' && view.id === pr.id}
                      onClick={() => onSelect({ type: 'pr', id: pr.id, num: pr.num })} />
                  ))}
                  {prOpen(root.name) && root.prs.length === 0 && (
                    <div style={{ padding: '7px 13px 9px 32px', fontSize: 11, color: 'var(--gh-fg-4)',
                      fontFamily: 'var(--gh-font-mono)' }}>no open PRs</div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <div style={{ padding: '12px' }}>
          <button className="gh-btn" style={{ width: '100%', height: 32, borderRadius: 7,
            border: '1px dashed var(--gh-line-2)', color: 'var(--gh-fg-3)', fontSize: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--gh-fg-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gh-fg-3)'; }}>
            <IPlus size={12} /> Add local repository…
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const WtActionBtn = ({ icon, label, primary, count, onClick }) => (
  <button className="gh-btn" onClick={onClick} style={{ height: 28, padding: primary ? '0 12px' : '0 11px',
    borderRadius: 6, fontSize: 12, fontWeight: primary ? 600 : 500,
    background: primary ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.04)',
    color: primary ? '#15151a' : 'var(--gh-fg-1)',
    border: primary ? 'none' : '1px solid var(--gh-line-2)',
    display: 'inline-flex', alignItems: 'center', gap: 6 }}
    onMouseEnter={e => { if (!primary) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
    onMouseLeave={e => { if (!primary) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
    {icon} {label}
    {count != null && <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 10.5,
      color: primary ? 'rgba(21,21,26,0.55)' : 'var(--gh-fg-4)' }}>{count}</span>}
  </button>
);

const mItem = {
  display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 5,
  fontSize: 12.5, color: 'var(--gh-fg-1)', width: '100%', textAlign: 'left',
};

// Branch + worktree management — ⋯ menu with create/remove, inline name composer.
const WtManageMenu = ({ w, onAdd, onRemove }) => {
  const [open, setOpen] = React.useState(false);
  const [composer, setComposer] = React.useState(null); // { mode: 'branch'|'worktree' }
  const [name, setName] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open && !composer) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setComposer(null); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setComposer(null); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open, composer]);

  const startComposer = (mode) => { setOpen(false); setComposer({ mode }); setName(mode === 'worktree' ? w.branch : ''); };
  const submit = () => { if (name.trim()) { onAdd(name.trim(), composer.mode); setComposer(null); setName(''); } };

  const hoverBg = (e, on) => e.currentTarget.style.background = on ? 'rgba(255,255,255,0.07)' : 'transparent';
  const hoverDanger = (e, on) => { e.currentTarget.style.background = on ? 'rgba(224,122,122,0.12)' : 'transparent'; };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button className="gh-btn" title="Branch & worktree actions" onClick={() => { setOpen(o => !o); setComposer(null); }}
        style={{ height: 28, width: 30, borderRadius: 6,
          background: open ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
          border: '1px solid var(--gh-line-2)', color: 'var(--gh-fg-2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <IDots size={15} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 32, right: 0, zIndex: 40, width: 230,
          background: 'rgba(28,28,32,0.98)', border: '1px solid var(--gh-line-2)',
          borderRadius: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.55)', padding: 5,
          backdropFilter: 'blur(20px)' }}>
          <div style={{ padding: '4px 9px 5px', fontFamily: 'var(--gh-font-mono)', fontSize: 9.5,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gh-fg-4)' }}>Branch</div>
          <button className="gh-btn" style={mItem} onClick={() => startComposer('branch')}
            onMouseEnter={e => hoverBg(e, true)} onMouseLeave={e => hoverBg(e, false)}>
            <IPlus size={13} /> New branch…
          </button>
          <button className="gh-btn" disabled={w.primary}
            style={{ ...mItem, color: w.primary ? 'var(--gh-fg-4)' : 'var(--gh-danger)', cursor: w.primary ? 'default' : 'pointer' }}
            onClick={() => { if (!w.primary) { setOpen(false); onRemove('branch'); } }}
            onMouseEnter={e => { if (!w.primary) hoverDanger(e, true); }} onMouseLeave={e => hoverDanger(e, false)}>
            <ITrash size={13} /> Delete branch
          </button>

          <div style={{ height: 1, background: 'var(--gh-line-1)', margin: '4px 2px' }} />

          <div style={{ padding: '4px 9px 5px', fontFamily: 'var(--gh-font-mono)', fontSize: 9.5,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gh-fg-4)' }}>Worktree</div>
          <button className="gh-btn" style={mItem} onClick={() => startComposer('worktree')}
            onMouseEnter={e => hoverBg(e, true)} onMouseLeave={e => hoverBg(e, false)}>
            <IFolder size={13} /> New worktree…
          </button>
          <button className="gh-btn" disabled={w.primary}
            style={{ ...mItem, color: w.primary ? 'var(--gh-fg-4)' : 'var(--gh-danger)', cursor: w.primary ? 'default' : 'pointer' }}
            onClick={() => { if (!w.primary) { setOpen(false); onRemove('worktree'); } }}
            onMouseEnter={e => { if (!w.primary) hoverDanger(e, true); }} onMouseLeave={e => hoverDanger(e, false)}>
            <ITrash size={13} /> Remove worktree
          </button>
        </div>
      )}

      {composer && (
        <div style={{ position: 'absolute', top: 32, right: 0, zIndex: 40, width: 276,
          background: 'rgba(28,28,32,0.98)', border: '1px solid var(--gh-line-2)',
          borderRadius: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.55)', padding: 10,
          backdropFilter: 'blur(20px)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--gh-fg-2)', marginBottom: 7 }}>
            {composer.mode === 'branch' ? 'New branch (creates a worktree)' : 'New worktree from branch'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 30,
            background: 'rgba(0,0,0,0.25)', border: '1px solid var(--gh-line-2)', borderRadius: 6, padding: '0 9px' }}>
            <IBranch size={12} stroke={1.6} style={{ color: 'var(--gh-fg-4)' }} />
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              placeholder={composer.mode === 'branch' ? 'feature/my-branch' : 'existing-branch'}
              style={{ flex: 1, background: 'transparent', border: 0, outline: 'none',
                color: 'var(--gh-fg-1)', fontFamily: 'var(--gh-font-mono)', fontSize: 12 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 9 }}>
            <button className="gh-btn" onClick={() => { setComposer(null); setName(''); }}
              style={{ height: 26, padding: '0 10px', borderRadius: 5, fontSize: 11.5, color: 'var(--gh-fg-2)' }}>Cancel</button>
            <button className="gh-btn" onClick={submit} disabled={!name.trim()}
              style={{ height: 26, padding: '0 12px', borderRadius: 5, fontSize: 11.5, fontWeight: 600,
                background: name.trim() ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)',
                color: name.trim() ? '#15151a' : 'var(--gh-fg-4)', cursor: name.trim() ? 'pointer' : 'default' }}>
              Create
            </button>
          </div>
        </div>
      )}
    </span>
  );
};

const WtDetailHeader = ({ w, linkedPr, onAdd, onRemove }) => (
  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gh-line-1)',
    display: 'flex', flexDirection: 'column', gap: 12,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <IBranch size={15} stroke={1.6} style={{ color: 'var(--gh-fg-3)' }} />
      <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 15, fontWeight: 600,
        color: 'var(--gh-fg-1)', flex: 1, minWidth: 0,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.branch}</span>
      {w.primary && <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4,
        background: 'rgba(255,255,255,0.06)', color: 'var(--gh-fg-3)', letterSpacing: '0.05em',
        textTransform: 'uppercase', fontWeight: 700 }}>primary</span>}
      {linkedPr && <button className="gh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: 'var(--gh-font-mono)', fontSize: 12, color: 'var(--gh-fg-3)' }}>
        <IGitPullRequest size={12} stroke={1.6} /> #{linkedPr.num}
      </button>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      fontFamily: 'var(--gh-font-mono)', fontSize: 12, color: 'var(--gh-fg-3)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <RootGlyph name={w.rootName} size={14} />{w.rootName}
      </span>
      <span style={{ width: 1, height: 12, background: 'var(--gh-line-2)' }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className={`gh-dot ${w.dirty ? 'warn' : 'ok'}`} />
        {w.dirty ? '4 uncommitted' : 'working tree clean'}
      </span>
      <span style={{ width: 1, height: 12, background: 'var(--gh-line-2)' }} />
      <span>↑{w.ahead} ↓{w.behind}</span>
      <span style={{ width: 1, height: 12, background: 'var(--gh-line-2)' }} />
      <span style={{ color: 'var(--gh-fg-4)', whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', maxWidth: 260 }}>{w.path}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <OpenWithSplit />
      <span style={{ width: 1, height: 18, background: 'var(--gh-line-1)', margin: '0 2px' }} />
      {w.dirty && <WtActionBtn primary icon={<IGitCommit size={12} />} label="Commit" count={4} />}
      <WtActionBtn icon={<IUpload size={12} />} label="Push" />
      <WtActionBtn icon={<IDownload size={12} />} label="Pull" />
      {w.behind > 0 && <WtActionBtn icon={<IGitMerge size={12} />} label="Merge main" />}
      <span style={{ flex: 1 }} />
      <WtManageMenu w={w} onAdd={onAdd} onRemove={onRemove} />
    </div>
  </div>
);

const DiffSectionBand = ({ icon, label, count, tone }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
    background: 'rgba(0,0,0,0.22)', borderTop: '1px solid var(--gh-line-2)',
    borderBottom: '1px solid var(--gh-line-1)',
    fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, letterSpacing: '0.06em',
    textTransform: 'uppercase' }}>
    <span style={{ color: tone || 'var(--gh-fg-3)', display: 'inline-flex' }}>{icon}</span>
    <span style={{ color: tone || 'var(--gh-fg-3)' }}>{label}</span>
    {count != null && <span style={{ color: 'var(--gh-fg-4)' }}>{count}</span>}
  </div>
);

const WtDetail = ({ w, onAdd, onRemove }) => {
  const linkedPr = linkedPrForBranch(w.branch);
  const diff = linkedPr ? getDiff(linkedPr.num) : null;
  const files = diff ? diff.files : [];
  const uncommitted = w.dirty ? files.slice(0, 1) : [];
  const committed = files.slice(uncommitted.length);

  return (
    <>
      <PaneTitle name={`worktree · ${w.path.split('/').pop()}`} active={true}
        extra={w.dirty ? 'modified' : 'clean'} />
      <WtDetailHeader w={w} linkedPr={linkedPr} onAdd={onAdd} onRemove={onRemove} />
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', background: 'var(--gh-bg-1)' }}>
        {files.length === 0 ? (
          <div style={{ padding: '20px 18px', textAlign: 'center', fontFamily: 'var(--gh-font-mono)',
            fontSize: 12, color: 'var(--gh-fg-4)' }}>
            Working tree clean — up to date with main.
          </div>
        ) : (
          <>
            {uncommitted.length > 0 && (
              <>
                <DiffSectionBand icon={<span className="gh-dot warn" style={{ width: 7, height: 7 }} />}
                  label="Uncommitted · working tree" count={uncommitted.length} tone="var(--gh-warn)" />
                {uncommitted.map((f, i) => <FileDiff key={`u${i}`} file={f} />)}
              </>
            )}
            <DiffSectionBand icon={<IGitCommit size={11} />}
              label="Committed · ahead of main" count={committed.length} />
            {committed.map((f, i) => <FileDiff key={`c${i}`} file={f} />)}
            <div style={{ padding: '14px 18px', textAlign: 'center', fontSize: 11,
              color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>~ end of diff ~</div>
          </>
        )}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// PR detail — reviewer header + diff, with a "checkout as worktree" action.
const PrDetail = ({ pr, decided, setDecided, hasWorktree, onCheckout }) => {
  const diff = getDiff(pr.num);
  const checkoutBtn = (
    <button className="gh-btn" onClick={() => onCheckout(pr)} title="Create a local worktree for this branch and switch to it"
      style={{ height: 28, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
        background: hasWorktree ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)',
        color: hasWorktree ? 'var(--gh-fg-1)' : '#15151a',
        border: hasWorktree ? '1px solid var(--gh-line-2)' : 'none',
        display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <IFolder size={13} /> {hasWorktree ? 'Go to worktree' : 'Checkout as worktree'}
    </button>
  );
  return (
    <>
      <PaneTitle name={`diff · #${pr.num}`} active={true} extra={`${diff.summary.files} files`} />
      <PRHeader pr={pr} diff={diff} decided={decided} setDecided={setDecided} extraActions={checkoutBtn} />
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', background: 'var(--gh-bg-1)' }}>
        {diff.files.map((f, i) => <FileDiff key={i} file={f} />)}
        <div style={{ padding: '14px 18px', textAlign: 'center', fontSize: 11,
          color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>~ end of diff ~</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
const FusionApp = () => {
  const [roots, setRoots] = React.useState(FUSION_ROOTS);
  const [decisions, setDecisions] = React.useState({});
  const [newSeq, setNewSeq] = React.useState(1);
  const [view, setView] = React.useState(() => {
    const r = FUSION_ROOTS[0];
    const p = r.prs[0];
    return { type: 'pr', id: p.id, num: p.num };
  });

  // Flattened worktrees with rootName + id (ungrouped list).
  const allWorktrees = roots.flatMap(r =>
    r.worktrees.map(w => ({ ...w, rootName: r.name, id: wtId(r.name, w.path) })));

  let pr = null, wt = null;
  if (view.type === 'pr') pr = SAMPLE_PRS.find(p => p.id === view.id);
  if (view.type === 'wt') wt = allWorktrees.find(w => w.id === view.id);

  const setDecided = (d) => pr && setDecisions(prev => ({ ...prev, [pr.id]: prev[pr.id] === d ? null : d }));

  // Create a worktree on a branch in a given root; select it (or select the
  // existing one if the branch already has a worktree).
  const createWorktree = (rootName, branch, prNum) => {
    const root = roots.find(r => r.name === rootName);
    if (!root) return;
    const existing = root.worktrees.find(w => w.branch === branch);
    const slug = branch.split('/').pop();
    const path = existing ? existing.path : `${root.path}-${slug}`;
    if (!existing) {
      setRoots(prev => prev.map(r => r.name !== rootName ? r : {
        ...r,
        worktrees: [...r.worktrees, { path, branch, dirty: false, primary: false, ahead: 0, behind: 0, prNum }],
      }));
    }
    setView({ type: 'wt', id: wtId(rootName, path) });
  };

  // From a worktree-detail action.
  const addFromWorktree = (currentWt, name, mode) => {
    createWorktree(currentWt.rootName, name);
  };
  const removeCurrentWorktree = (currentWt) => {
    setRoots(prev => prev.map(r => r.name !== currentWt.rootName ? r : {
      ...r, worktrees: r.worktrees.filter(w => w.path !== currentWt.path),
    }));
    const r0 = roots[0], p0 = r0.prs[0];
    setView({ type: 'pr', id: p0.id, num: p0.num });
  };

  // From a root header "+".
  const newWorktreeQuick = (rootName) => {
    createWorktree(rootName, `feature/new-${newSeq}`);
    setNewSeq(n => n + 1);
  };

  // From a PR — checkout its branch as a local worktree.
  const checkoutPr = (p) => {
    const d = getDiff(p.num);
    createWorktree(repoToRoot(p.repo), d.head, p.num);
  };
  const prHasWorktree = pr
    ? allWorktrees.some(w => w.rootName === repoToRoot(pr.repo) && w.branch === getDiff(pr.num).head)
    : false;

  return (
    <div className="gh" style={{ width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: 'var(--gh-bg-1)', borderRadius: 10,
      border: '1px solid var(--gh-line-2)', boxShadow: 'var(--gh-shadow-window)' }}>
      {/* Title bar */}
      <div style={{ height: 40, flex: '0 0 auto', display: 'flex', alignItems: 'center',
        gap: 12, padding: '0 14px', borderBottom: '1px solid var(--gh-line-1)',
        background: 'var(--gh-bg-2)' }}>
        <span className="gh-traffic">
          <span className="gh-tl close" /><span className="gh-tl min" /><span className="gh-tl max" />
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginLeft: 4 }}>
          <IGitPullRequest size={14} stroke={1.6} style={{ color: 'var(--gh-fg-3)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gh-fg-1)' }}>Review</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="gh-btn" title="Refresh" style={{ width: 28, height: 28, borderRadius: 6,
            color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><IRefresh size={14} /></button>
          <button className="gh-btn" style={{ width: 28, height: 28, borderRadius: 6,
            color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><IDots size={16} /></button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <FusionSidebar roots={roots} view={view}
          onSelect={setView} onNewWorktree={newWorktreeQuick} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {view.type === 'pr' && pr && (
            <PrDetail pr={pr} decided={decisions[pr.id]} setDecided={setDecided}
              hasWorktree={prHasWorktree} onCheckout={checkoutPr} />
          )}
          {view.type === 'wt' && wt && (
            <WtDetail w={wt}
              onAdd={(name, mode) => addFromWorktree(wt, name, mode)}
              onRemove={() => removeCurrentWorktree(wt)} />
          )}
          {view.type === 'wt' && !wt && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)', fontSize: 12 }}>
              worktree removed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  FusionApp,
  FUSION_ROOTS, wtId, repoToRoot, linkedPrForBranch,
  WtManageMenu, DiffSectionBand, WtActionBtn, RootGlyph,
});
