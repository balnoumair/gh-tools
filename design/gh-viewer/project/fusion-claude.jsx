// fusion-claude.jsx — SAME fusion app, different visual style only. A cleaner
// cool-dark theme (soft indigo accent, rounded selection pills, sans titles +
// mono only for code/paths). No orange. Structure & behavior mirror FusionApp;
// the heavy diff/PR/worktree-menu machinery is reused and re-themed via scoped
// CSS variables on the root wrapper.

// Cool-dark token overrides applied to the whole subtree. Reused components
// (FileDiff, PRHeader, OpenWithSplit, WtManageMenu) inherit these.
const CC_THEME = {
  '--gh-bg-0': '#0a0b0d',
  '--gh-bg-1': '#17181c',   // main pane
  '--gh-bg-2': '#101116',   // sidebar
  '--gh-bg-3': '#1e2026',
  '--gh-bg-4': '#23252c',
  '--gh-line-1': 'rgba(255,255,255,0.05)',
  '--gh-line-2': 'rgba(255,255,255,0.09)',
  '--gh-line-3': 'rgba(255,255,255,0.14)',
  '--gh-fg-1': '#ECEDEF',
  '--gh-fg-2': '#A4A9B2',
  '--gh-fg-3': '#71767E',
  '--gh-fg-4': '#4B505A',
  '--gh-success': '#6fcf97',
  '--gh-danger': '#e98b8b',
  '--gh-warn': '#d9c98a',
  '--gh-info': '#8fa6e6',
  // new, theme-local
  '--cc-accent': '#8b8ff0',
  '--cc-accent-soft': 'rgba(139,143,240,0.15)',
  '--cc-accent-line': 'rgba(139,143,240,0.40)',
  '--cc-sans': 'var(--gh-font-ui)',
};

const ccId = (rootName, path) => `${rootName}:${path}`;
const ccRepoRoot = (repo) => repo.split('/')[1];
const ccLinkedPr = (branch) => SAMPLE_PRS.find(p => { const d = getDiff(p.num); return d && d.head === branch; });

// Rounded monogram.
const CCGlyph = ({ name, size = 20 }) => (
  <span style={{
    width: size, height: size, borderRadius: Math.round(size * 0.3),
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--gh-line-2)',
    color: 'var(--gh-fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--gh-font-mono)', fontSize: Math.round(size * 0.46),
    fontWeight: 600, lineHeight: 1, flex: '0 0 auto',
  }}>{name[0]}</span>
);

// ---------------------------------------------------------------------------
// Sidebar bits — rounded pill rows, accent selection, sans labels.
const CCRootHeader = ({ root, open, onToggle, onNewWorktree }) => (
  <div role="button" onClick={onToggle} style={{
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
    margin: '8px 8px 2px', padding: '7px 9px', borderRadius: 9,
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <span style={{ display: 'inline-flex', color: 'var(--gh-fg-4)',
      transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}>
      <IChevD size={11} stroke={2} />
    </span>
    <CCGlyph name={root.name} size={22} />
    <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 13, fontWeight: 600,
      color: 'var(--gh-fg-1)', flex: 1, minWidth: 0, letterSpacing: '-0.01em',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{root.name}</span>
    {root.dirty && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gh-warn)' }} />}
    <button className="gh-btn" title="New worktree" onClick={(e) => { e.stopPropagation(); onNewWorktree(root.name); }}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, borderRadius: 6, color: 'var(--gh-fg-3)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--gh-fg-1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gh-fg-3)'; }}>
      <IPlus size={11} />
    </button>
  </div>
);

const CCSubLabel = ({ label, count, open, onToggle }) => (
  <div role="button" onClick={onToggle} style={{ cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, margin: '4px 10px 2px', padding: '4px 4px',
    fontFamily: 'var(--cc-sans)', fontSize: 11, fontWeight: 600, color: 'var(--gh-fg-3)' }}>
    <span style={{ display: 'inline-flex', color: 'var(--gh-fg-4)',
      transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}>
      <IChevD size={8} stroke={2} />
    </span>
    <span>{label}</span>
    <span style={{ color: 'var(--gh-fg-4)', fontWeight: 500 }}>{count}</span>
  </div>
);

// Rounded pill row base — uniform height across worktree & PR rows.
const ccRow = (active) => ({
  display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
  minHeight: 58, boxSizing: 'border-box',
  margin: '1px 8px', padding: '8px 9px', borderRadius: 9,
  background: active ? 'var(--cc-accent-soft)' : 'transparent',
  boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none',
});

const CCWtRow = ({ w, active, onClick }) => (
  <div onClick={onClick} style={ccRow(active)}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
    <IFolder size={14} style={{ color: active ? 'var(--cc-accent)' : 'var(--gh-fg-4)', flex: '0 0 auto' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 12,
          color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.branch}</span>
        {w.primary && <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 9, padding: '1px 5px', borderRadius: 5,
          background: 'rgba(255,255,255,0.06)', color: 'var(--gh-fg-3)', fontWeight: 600, flex: '0 0 auto' }}>main</span>}
      </div>
      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, color: 'var(--gh-fg-4)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%',
            background: w.dirty ? 'var(--gh-warn)' : 'var(--gh-success)' }} />
          {w.dirty ? 'modified' : 'clean'}
        </span>
        <span>↑{w.ahead} ↓{w.behind}</span>
      </div>
    </div>
  </div>
);

const CCPrRow = ({ pr, active, onClick }) => {
  const ci = ciMeta[pr.ci] || ciMeta.idle;
  const dotColor = { ok: 'var(--gh-success)', bad: 'var(--gh-danger)', warn: 'var(--gh-warn)',
    info: 'var(--gh-info)', idle: 'var(--gh-fg-4)' }[ci.dot] || 'var(--gh-fg-4)';
  return (
    <div onClick={onClick} style={ccRow(active)}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 11, color: 'var(--gh-fg-4)', flex: '0 0 auto' }}>#{pr.num}</span>
          <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 12.5,
            color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)', fontWeight: active ? 600 : 500, lineHeight: 1.32,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pr.title}</span>
        </div>
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, color: 'var(--gh-fg-4)' }}>
          <span style={{ color: stateBadge[pr.state]?.tone || 'var(--gh-fg-3)' }}>{pr.state}</span>
          <span>·</span><span>{pr.author}</span><span>·</span><span>{pr.age}</span>
        </div>
      </div>
    </div>
  );
};

const CCSidebar = ({ roots, view, onSelect, onNewWorktree }) => {
  const [openRoot, setOpenRoot] = React.useState(() => Object.fromEntries(roots.map(r => [r.name, true])));
  const [prHidden, setPrHidden] = React.useState({});
  const prOpen = (n) => !prHidden[n];
  return (
    <div style={{ width: 322, flex: '0 0 auto', display: 'flex', flexDirection: 'column',
      background: 'var(--gh-bg-2)', borderRight: '1px solid var(--gh-line-1)' }}>
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
        {roots.map(root => {
          const open = openRoot[root.name];
          return (
            <div key={root.name}>
              <CCRootHeader root={root} open={open} onNewWorktree={onNewWorktree}
                onToggle={() => setOpenRoot(o => ({ ...o, [root.name]: !o[root.name] }))} />
              {open && (
                <>
                  {root.worktrees.map(w => {
                    const id = ccId(root.name, w.path);
                    return <CCWtRow key={id} w={w}
                      active={view.type === 'wt' && view.id === id}
                      onClick={() => onSelect({ type: 'wt', id })} />;
                  })}
                  <CCSubLabel label="Pull requests" count={root.prs.length}
                    open={prOpen(root.name)} onToggle={() => setPrHidden(h => ({ ...h, [root.name]: !h[root.name] }))} />
                  {prOpen(root.name) && root.prs.map(pr => (
                    <CCPrRow key={pr.id} pr={pr}
                      active={view.type === 'pr' && view.id === pr.id}
                      onClick={() => onSelect({ type: 'pr', id: pr.id, num: pr.num })} />
                  ))}
                  {prOpen(root.name) && root.prs.length === 0 && (
                    <div style={{ margin: '1px 8px', padding: '5px 9px 7px 28px', fontSize: 11,
                      color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>no open PRs</div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div style={{ padding: '8px 12px 4px' }}>
          <button className="gh-btn" style={{ width: '100%', height: 34, borderRadius: 9,
            border: '1px solid var(--gh-line-2)', color: 'var(--gh-fg-2)', fontSize: 12.5,
            fontFamily: 'var(--cc-sans)', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--gh-fg-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gh-fg-2)'; }}>
            <IPlus size={13} /> Add local repository…
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Pane breadcrumb (replaces the tmux-style strip).
const CCBreadcrumb = ({ icon, crumbs, right }) => (
  <div style={{ height: 34, flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8,
    padding: '0 16px', borderBottom: '1px solid var(--gh-line-1)', background: 'var(--gh-bg-1)' }}>
    <span style={{ color: 'var(--gh-fg-4)', display: 'inline-flex' }}>{icon}</span>
    {crumbs.map((c, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ color: 'var(--gh-fg-4)' }}>›</span>}
        <span style={{ fontFamily: i === crumbs.length - 1 ? 'var(--gh-font-mono)' : 'var(--cc-sans)',
          fontSize: 12, color: i === crumbs.length - 1 ? 'var(--gh-fg-2)' : 'var(--gh-fg-3)' }}>{c}</span>
      </React.Fragment>
    ))}
    {right && <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono)', fontSize: 11.5,
      color: 'var(--gh-fg-4)' }}>{right}</span>}
  </div>
);

const CCBtn = ({ icon, label, primary, count, onClick }) => (
  <button className="gh-btn" onClick={onClick} style={{ height: 30, padding: primary ? '0 13px' : '0 11px',
    borderRadius: 8, fontSize: 12, fontWeight: primary ? 600 : 500, fontFamily: 'var(--cc-sans)',
    background: primary ? 'var(--cc-accent)' : 'rgba(255,255,255,0.04)',
    color: primary ? '#0e0f14' : 'var(--gh-fg-1)',
    border: primary ? 'none' : '1px solid var(--gh-line-2)',
    display: 'inline-flex', alignItems: 'center', gap: 6 }}
    onMouseEnter={e => { e.currentTarget.style.background = primary ? '#9a9ef3' : 'rgba(255,255,255,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = primary ? 'var(--cc-accent)' : 'rgba(255,255,255,0.04)'; }}>
    {icon} {label}
    {count != null && <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 10.5,
      color: primary ? 'rgba(14,15,20,0.55)' : 'var(--gh-fg-4)' }}>{count}</span>}
  </button>
);

// ---------------------------------------------------------------------------
// Worktree detail — re-themed header; reuses FileDiff / DiffSectionBand / WtManageMenu.
const CCWtDetail = ({ w, onAdd, onRemove }) => {
  const linkedPr = ccLinkedPr(w.branch);
  const diff = linkedPr ? getDiff(linkedPr.num) : null;
  const files = diff ? diff.files : [];
  const uncommitted = w.dirty ? files.slice(0, 1) : [];
  const committed = files.slice(uncommitted.length);
  return (
    <>
      <CCBreadcrumb icon={<IFolder size={13} />}
        crumbs={[w.rootName, 'worktree', w.path.split('/').pop()]}
        right={w.dirty ? 'modified' : 'clean'} />
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--gh-line-1)',
        display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IBranch size={16} stroke={1.6} style={{ color: 'var(--cc-accent)' }} />
          <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 15.5, fontWeight: 600,
            color: 'var(--gh-fg-1)', flex: 1, minWidth: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.branch}</span>
          {w.primary && <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 10, padding: '2px 7px', borderRadius: 6,
            background: 'rgba(255,255,255,0.06)', color: 'var(--gh-fg-3)', fontWeight: 600 }}>primary</span>}
          {linkedPr && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--gh-font-mono)', fontSize: 12, color: 'var(--cc-accent)' }}>
            <IGitPullRequest size={12} stroke={1.6} /> #{linkedPr.num}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          fontFamily: 'var(--gh-font-mono)', fontSize: 12, color: 'var(--gh-fg-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%',
              background: w.dirty ? 'var(--gh-warn)' : 'var(--gh-success)' }} />
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
          {w.dirty && <CCBtn primary icon={<IGitCommit size={12} />} label="Commit" count={4} />}
          <CCBtn icon={<IUpload size={12} />} label="Push" />
          <CCBtn icon={<IDownload size={12} />} label="Pull" />
          {w.behind > 0 && <CCBtn icon={<IGitMerge size={12} />} label="Merge main" />}
          <span style={{ flex: 1 }} />
          <WtManageMenu w={w} onAdd={onAdd} onRemove={onRemove} />
        </div>
      </div>
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', background: 'var(--gh-bg-1)' }}>
        {files.length === 0 ? (
          <div style={{ padding: '24px 18px', textAlign: 'center', fontFamily: 'var(--gh-font-mono)',
            fontSize: 12, color: 'var(--gh-fg-4)' }}>Working tree clean — up to date with main.</div>
        ) : (
          <>
            {uncommitted.length > 0 && (
              <>
                <DiffSectionBand icon={<span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gh-warn)' }} />}
                  label="Uncommitted · working tree" count={uncommitted.length} tone="var(--gh-warn)" />
                {uncommitted.map((f, i) => <FileDiff key={`u${i}`} file={f} />)}
              </>
            )}
            <DiffSectionBand icon={<IGitCommit size={11} />} label="Committed · ahead of main" count={committed.length} />
            {committed.map((f, i) => <FileDiff key={`c${i}`} file={f} />)}
            <div style={{ padding: '14px 18px', textAlign: 'center', fontSize: 11,
              color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>~ end of diff ~</div>
          </>
        )}
      </div>
    </>
  );
};

// PR detail — reuses PRHeader + FileDiff; accent checkout button.
const CCPrDetail = ({ pr, decided, setDecided, hasWorktree, onCheckout }) => {
  const diff = getDiff(pr.num);
  const checkoutBtn = (
    <button className="gh-btn" onClick={() => onCheckout(pr)}
      title="Create a local worktree for this branch and switch to it"
      style={{ height: 28, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'var(--cc-sans)',
        background: hasWorktree ? 'rgba(255,255,255,0.04)' : 'var(--cc-accent)',
        color: hasWorktree ? 'var(--gh-fg-1)' : '#0e0f14',
        border: hasWorktree ? '1px solid var(--gh-line-2)' : 'none',
        display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <IFolder size={13} /> {hasWorktree ? 'Go to worktree' : 'Checkout as worktree'}
    </button>
  );
  return (
    <>
      <CCBreadcrumb icon={<IGitPullRequest size={13} stroke={1.6} />}
        crumbs={[ccRepoRoot(pr.repo), `#${pr.num}`]} right={`${diff.summary.files} files`} />
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
const CCFusionApp = () => {
  const [roots, setRoots] = React.useState(FUSION_ROOTS);
  const [decisions, setDecisions] = React.useState({});
  const [newSeq, setNewSeq] = React.useState(1);
  const [view, setView] = React.useState(() => {
    const r = FUSION_ROOTS[0]; const p = r.prs[0];
    return { type: 'pr', id: p.id, num: p.num };
  });

  const allWorktrees = roots.flatMap(r => r.worktrees.map(w => ({ ...w, rootName: r.name, id: ccId(r.name, w.path) })));
  let pr = null, wt = null;
  if (view.type === 'pr') pr = SAMPLE_PRS.find(p => p.id === view.id);
  if (view.type === 'wt') wt = allWorktrees.find(w => w.id === view.id);
  const setDecided = (d) => pr && setDecisions(prev => ({ ...prev, [pr.id]: prev[pr.id] === d ? null : d }));

  const createWorktree = (rootName, branch, prNum) => {
    const root = roots.find(r => r.name === rootName);
    if (!root) return;
    const existing = root.worktrees.find(w => w.branch === branch);
    const slug = branch.split('/').pop();
    const path = existing ? existing.path : `${root.path}-${slug}`;
    if (!existing) {
      setRoots(prev => prev.map(r => r.name !== rootName ? r : {
        ...r, worktrees: [...r.worktrees, { path, branch, dirty: false, primary: false, ahead: 0, behind: 0, prNum }],
      }));
    }
    setView({ type: 'wt', id: ccId(rootName, path) });
  };
  const removeCurrentWorktree = (cw) => {
    setRoots(prev => prev.map(r => r.name !== cw.rootName ? r : { ...r, worktrees: r.worktrees.filter(w => w.path !== cw.path) }));
    const r0 = roots[0], p0 = r0.prs[0];
    setView({ type: 'pr', id: p0.id, num: p0.num });
  };
  const newWorktreeQuick = (rootName) => { createWorktree(rootName, `feature/new-${newSeq}`); setNewSeq(n => n + 1); };
  const checkoutPr = (p) => { const d = getDiff(p.num); createWorktree(ccRepoRoot(p.repo), d.head, p.num); };
  const prHasWorktree = pr ? allWorktrees.some(w => w.rootName === ccRepoRoot(pr.repo) && w.branch === getDiff(pr.num).head) : false;

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--cc-accent-soft)',
            border: '1px solid var(--cc-accent-line)', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--cc-accent)' }}>
            <IGitPullRequest size={11} stroke={1.8} />
          </span>
          <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 13, fontWeight: 600,
            color: 'var(--gh-fg-1)', letterSpacing: '-0.01em' }}>Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end' }}>
          <button className="gh-btn" title="Refresh" style={{ width: 30, height: 30, borderRadius: 8,
            color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><IRefresh size={14} /></button>
          <button className="gh-btn" style={{ width: 30, height: 30, borderRadius: 8,
            color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><IDots size={16} /></button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <CCSidebar roots={roots} view={view} onSelect={setView} onNewWorktree={newWorktreeQuick} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {view.type === 'pr' && pr && (
            <CCPrDetail pr={pr} decided={decisions[pr.id]} setDecided={setDecided}
              hasWorktree={prHasWorktree} onCheckout={checkoutPr} />
          )}
          {view.type === 'wt' && wt && (
            <CCWtDetail w={wt} onAdd={(name, mode) => createWorktree(wt.rootName, name)} onRemove={() => removeCurrentWorktree(wt)} />
          )}
          {view.type === 'wt' && !wt && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)', fontSize: 12 }}>worktree removed</div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { CCFusionApp, CC_THEME });
