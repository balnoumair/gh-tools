// reviewer.jsx — Desktop "reviewer" app. Mac window, right sidebar lists open
// PRs, main pane shows the selected PR's unified git diff. Terminal-leaning:
// monospace metadata + diff, dense rows, neutral dark surfaces.

const REV = {
  addFg: '#7fd49a', addBg: 'rgba(110,196,138,0.10)', addGutter: 'rgba(110,196,138,0.16)',
  delFg: '#e88f8f', delBg: 'rgba(224,122,122,0.10)', delGutter: 'rgba(224,122,122,0.16)',
  hunkFg: '#8aaed8',
};

const statusGlyph = {
  modified: { ch: 'M', tone: 'var(--gh-warn)' },
  added:    { ch: 'A', tone: 'var(--gh-success)' },
  deleted:  { ch: 'D', tone: 'var(--gh-danger)' },
  renamed:  { ch: 'R', tone: 'var(--gh-info)' },
};

const ciMeta = {
  ok:      { dot: 'ok',   label: 'checks passing' },
  fail:    { dot: 'bad',  label: 'checks failing' },
  running: { dot: 'warn', label: 'checks running' },
  idle:    { dot: 'idle', label: 'no checks' },
};

const stateBadge = {
  review:   { label: 'review',   tone: 'var(--gh-info)' },
  yours:    { label: 'yours',    tone: 'var(--gh-fg-2)' },
  mention:  { label: 'mention',  tone: 'var(--gh-warn)' },
  assigned: { label: 'assigned', tone: 'var(--gh-fg-2)' },
};

// --- Diff rendering --------------------------------------------------------

const DiffLine = ({ ln }) => {
  const isAdd = ln.type === 'add', isDel = ln.type === 'del';
  const bg = isAdd ? REV.addBg : isDel ? REV.delBg : 'transparent';
  const gutterBg = isAdd ? REV.addGutter : isDel ? REV.delGutter : 'transparent';
  const sign = isAdd ? '+' : isDel ? '-' : ' ';
  const codeFg = isAdd ? REV.addFg : isDel ? REV.delFg : 'var(--gh-fg-2)';
  const gut = { textAlign: 'right', padding: '0 8px', color: 'var(--gh-fg-4)',
    fontSize: 11, userSelect: 'none', background: gutterBg,
    borderRight: '1px solid var(--gh-line-1)' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '46px 46px 1fr',
      background: bg, lineHeight: '19px', minHeight: 19 }}>
      <span style={gut}>{ln.old ?? ''}</span>
      <span style={gut}>{ln.nw ?? ''}</span>
      <span style={{ display: 'flex', paddingLeft: 6, paddingRight: 12,
        whiteSpace: 'pre', color: codeFg, fontSize: 12 }}>
        <span style={{ width: 12, flex: '0 0 auto', color: isAdd ? REV.addFg : isDel ? REV.delFg : 'var(--gh-fg-4)',
          opacity: sign === ' ' ? 0 : 0.9 }}>{sign}</span>
        <span style={{ flex: 1 }}>{ln.text || ' '}</span>
      </span>
    </div>
  );
};

const FileDiff = ({ file }) => {
  const [open, setOpen] = React.useState(true);
  const g = statusGlyph[file.status] || statusGlyph.modified;
  return (
    <div style={{ borderBottom: '1px solid var(--gh-line-1)' }}>
      {/* Sticky file header */}
      <div onClick={() => setOpen(o => !o)} style={{
        position: 'sticky', top: 0, zIndex: 1,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', cursor: 'pointer',
        background: 'rgba(26,26,29,0.94)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--gh-line-1)',
      }}>
        <span style={{ color: 'var(--gh-fg-3)', display: 'inline-flex',
          transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }}>
          <IChevD size={12} stroke={2} />
        </span>
        <span style={{ width: 16, height: 16, borderRadius: 4, flex: '0 0 auto',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--gh-font-mono)', fontSize: 10, fontWeight: 700,
          color: g.tone, border: `1px solid ${g.tone}`, opacity: 0.9 }}>{g.ch}</span>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 12.5,
          color: 'var(--gh-fg-1)', flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          direction: 'rtl', textAlign: 'left' }}>{file.path}</span>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 11, flex: '0 0 auto',
          display: 'flex', gap: 8 }}>
          <span style={{ color: REV.addFg }}>+{file.additions}</span>
          <span style={{ color: REV.delFg }}>−{file.deletions}</span>
        </span>
      </div>
      {/* Hunks */}
      {open && (
        <div style={{ fontFamily: 'var(--gh-font-mono)' }}>
          {file.hunks.map((h, i) => (
            <div key={i}>
              <div style={{ padding: '3px 14px 3px 92px', fontSize: 11,
                color: REV.hunkFg, background: 'rgba(138,174,216,0.06)',
                borderTop: i === 0 ? 'none' : '1px solid var(--gh-line-1)',
                borderBottom: '1px solid var(--gh-line-1)',
                whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.header}</div>
              {h.lines.map((ln, j) => <DiffLine key={j} ln={ln} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PR header band (above the diff) ---------------------------------------

const ReviewAction = ({ children, tone, onClick, active }) => (
  <button className="gh-btn" onClick={onClick} style={{
    height: 28, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
    color: tone || 'var(--gh-fg-2)',
    border: `1px solid ${active ? tone : 'var(--gh-line-2)'}`,
    background: active ? `color-mix(in srgb, ${tone} 14%, transparent)` : 'transparent',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background .12s, border-color .12s',
  }}
    onMouseEnter={e => e.currentTarget.style.background = active ? e.currentTarget.style.background : 'rgba(255,255,255,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = active ? e.currentTarget.style.background : 'transparent'}>
    {children}
  </button>
);

const BranchChip = ({ name, mono = true }) => (
  <span style={{ fontFamily: mono ? 'var(--gh-font-mono)' : 'inherit', fontSize: 11.5,
    color: 'var(--gh-fg-2)', padding: '2px 8px', borderRadius: 5,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--gh-line-1)',
    whiteSpace: 'nowrap' }}>{name}</span>
);

const PRHeader = ({ pr, diff, decided, setDecided, extraActions }) => {
  const ci = ciMeta[pr.ci] || ciMeta.idle;
  return (
    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gh-line-1)',
      display: 'flex', flexDirection: 'column', gap: 12,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 14, color: 'var(--gh-fg-3)' }}>#{pr.num}</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--gh-fg-1)',
          letterSpacing: '-0.01em', flex: 1 }}>{pr.title}</span>
        <button className="gh-btn" style={{ color: 'var(--gh-fg-3)', display: 'inline-flex',
          alignItems: 'center', gap: 6, fontSize: 12 }}>
          <IExternal size={14} /> GitHub
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        fontSize: 12, color: 'var(--gh-fg-3)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className={`gh-dot ${ci.dot}`} />
          <span style={{ fontFamily: 'var(--gh-font-mono)' }}>{ci.label}</span>
        </span>
        <span style={{ width: 1, height: 12, background: 'var(--gh-line-2)' }} />
        <BranchChip name={diff.base} />
        <span style={{ color: 'var(--gh-fg-4)' }}>←</span>
        <BranchChip name={diff.head} />
        <span style={{ width: 1, height: 12, background: 'var(--gh-line-2)' }} />
        <span style={{ fontFamily: 'var(--gh-font-mono)' }}>
          <span style={{ color: REV.addFg }}>+{diff.summary.additions}</span>{' '}
          <span style={{ color: REV.delFg }}>−{diff.summary.deletions}</span>{' '}
          <span style={{ color: 'var(--gh-fg-4)' }}>· {diff.summary.files} files · {diff.summary.commits} commits</span>
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono)' }}>{pr.author} · {pr.age}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ReviewAction tone="var(--gh-success)" active={decided === 'approve'} onClick={() => setDecided('approve')}>
          <ICheck size={14} /> Approve
        </ReviewAction>
        <ReviewAction tone="var(--gh-danger)" active={decided === 'reject'} onClick={() => setDecided('reject')}>
          Request changes
        </ReviewAction>
        <ReviewAction onClick={() => setDecided('comment')} active={decided === 'comment'}>
          Comment
        </ReviewAction>
        {extraActions && <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>{extraActions}</span>}
        {decided && (
          <span style={{ fontSize: 11.5, color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)',
            marginLeft: 4 }}>
            {decided === 'approve' ? '✓ marked approved' : decided === 'reject' ? '✗ changes requested' : '✎ review pending'}
          </span>
        )}
      </div>
    </div>
  );
};

// --- Left pane: PR list (tmux pane) ----------------------------------------

const PRListRow = ({ pr, active, onClick }) => {
  const ci = ciMeta[pr.ci] || ciMeta.idle;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9, height: 68, flex: '0 0 auto',
      padding: '0 12px 0 11px', cursor: 'pointer',
      borderLeft: `2px solid ${active ? 'var(--gh-fg-2)' : 'transparent'}`,
      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      borderBottom: '1px solid var(--gh-line-1)',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <span className={`gh-dot ${ci.dot}`} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)',
          fontWeight: active ? 600 : 500, lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {pr.title}
        </div>
      </div>
    </div>
  );
};

// tmux-style pane title strip. Active pane → green; inactive → muted.
const PaneTitle = ({ num, name, active, extra }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 24, flex: '0 0 auto',
    padding: '0 12px', fontFamily: 'var(--gh-font-mono)', fontSize: 11,
    borderBottom: '1px solid var(--gh-line-1)',
    background: active ? 'rgba(110,196,138,0.08)' : 'rgba(0,0,0,0.22)' }}>
    {num && <span style={{ color: active ? 'var(--gh-success)' : 'var(--gh-fg-4)', fontWeight: 600 }}>{num}</span>}
    <span style={{ color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-3)' }}>{name}</span>
    {extra && <span style={{ marginLeft: 'auto', color: 'var(--gh-fg-4)' }}>{extra}</span>}
  </div>
);

// Sidebar group header — repo name or "terminal", tmux-pane-divider styling.
const GroupHeader = ({ label, count, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, height: 22, flex: '0 0 auto',
    padding: '0 11px', fontFamily: 'var(--gh-font-mono)', fontSize: 10.5,
    letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--gh-fg-4)',
    background: 'rgba(0,0,0,0.22)',
    borderTop: '1px solid var(--gh-line-1)', borderBottom: '1px solid var(--gh-line-1)' }}>
    <span style={{ color: 'var(--gh-fg-4)' }}>─</span>
    <span style={{ color: 'var(--gh-fg-3)' }}>{label}</span>
    {count != null && <span style={{ color: 'var(--gh-fg-4)' }}>{count}</span>}
    {action}
  </div>
);

// A terminal session row in the sidebar's terminal section.
const TermRow = ({ term, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8, height: 68, flex: '0 0 auto',
    padding: '0 12px 0 11px', cursor: 'pointer',
    fontFamily: 'var(--gh-font-mono)', fontSize: 12,
    borderLeft: `2px solid ${active ? 'var(--gh-fg-2)' : 'transparent'}`,
    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
    borderBottom: '1px solid var(--gh-line-1)' }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
    <span style={{ color: active ? REV.addFg : 'var(--gh-fg-4)' }}>❯</span>
    <span style={{ color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)' }}>{term.shell}</span>
    <span style={{ marginLeft: 'auto', color: 'var(--gh-fg-4)', fontSize: 11 }}>{term.cwd}</span>
  </div>
);

// Group PRs by repo, preserving first-seen order.
const groupByRepo = (prs) => {
  const order = [];
  const map = {};
  prs.forEach(p => {
    const key = p.repo;
    if (!map[key]) { map[key] = []; order.push(key); }
    map[key].push(p);
  });
  return order.map(key => ({ repo: key, short: key.split('/')[1], prs: map[key] }));
};

const ReviewerSidebar = ({ prs, view, onSelectPr, terms, onSelectTerm, onAddTerm }) => {
  const groups = groupByRepo(prs);
  const addBtn = (
    <button className="gh-btn" onClick={(e) => { e.stopPropagation(); onAddTerm(); }} title="new terminal"
      style={{ marginLeft: 'auto', color: 'var(--gh-fg-3)', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 14, lineHeight: 1, width: 16 }}>+</button>
  );
  return (
    <div style={{ width: 300, flex: '0 0 auto', display: 'flex', flexDirection: 'column',
      background: 'var(--gh-bg-2)', borderRight: '1px solid var(--gh-line-2)' }}>
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {groups.map(g => (
          <div key={g.repo}>
            <GroupHeader label={g.short} count={g.prs.length} />
            {g.prs.map(pr => (
              <PRListRow key={pr.id} pr={pr}
                active={view.type === 'pr' && view.id === pr.id}
                onClick={() => onSelectPr(pr.id)} />
            ))}
          </div>
        ))}
        <GroupHeader label="terminal" count={terms.length} action={addBtn} />
        {terms.map(t => (
          <TermRow key={t.id} term={t}
            active={view.type === 'term' && view.id === t.id}
            onClick={() => onSelectTerm(t.id)} />
        ))}
      </div>
    </div>
  );
};

// --- Terminal pane ---------------------------------------------------------

const TermLine = ({ children, color }) => (
  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: color || 'var(--gh-fg-2)' }}>{children}</div>
);
const TermPrompt = ({ branch, cmd }) => (
  <div style={{ whiteSpace: 'pre-wrap', display: 'flex', gap: 0, flexWrap: 'wrap' }}>
    <span style={{ color: REV.addFg }}>noumair</span>
    <span style={{ color: 'var(--gh-fg-4)' }}>@mbp </span>
    <span style={{ color: REV.hunkFg }}>~/gh-viewer </span>
    {branch && <span style={{ color: 'var(--gh-warn)' }}>{`(${branch}) `}</span>}
    <span style={{ color: 'var(--gh-fg-4)' }}>❯ </span>
    <span style={{ color: 'var(--gh-fg-1)' }}>{cmd}</span>
  </div>
);

const TerminalPane = ({ tab }) => (
  <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', background: 'var(--gh-bg-1)',
    padding: '12px 16px', fontFamily: 'var(--gh-font-mono)', fontSize: 12.5, lineHeight: '1.65' }}>
    <TermPrompt branch="feat/worktree-pane" cmd="git status -sb" />
    <TermLine color="var(--gh-fg-3)">## feat/worktree-pane...origin/feat/worktree-pane</TermLine>
    <TermLine color={REV.addFg}> M src/worktree/manager.rs</TermLine>
    <TermLine color={REV.addFg}>?? src/worktree/orphan.rs</TermLine>
    <div style={{ height: 8 }} />
    <TermPrompt branch="feat/worktree-pane" cmd="cargo test worktree::orphan" />
    <TermLine color="var(--gh-fg-3)">   Compiling gh-viewer v0.4.1 (/Users/noumair/gh-viewer)</TermLine>
    <TermLine color="var(--gh-fg-3)">    Finished test [unoptimized + debuginfo] in 3.74s</TermLine>
    <TermLine color="var(--gh-fg-2)">     Running unittests src/lib.rs</TermLine>
    <div style={{ height: 4 }} />
    <TermLine color="var(--gh-fg-2)">running 3 tests</TermLine>
    <TermLine><span style={{ color: 'var(--gh-fg-2)' }}>test orphan::adds_worktree ... </span><span style={{ color: REV.addFg }}>ok</span></TermLine>
    <TermLine><span style={{ color: 'var(--gh-fg-2)' }}>test orphan::sorts_last ... </span><span style={{ color: REV.addFg }}>ok</span></TermLine>
    <TermLine><span style={{ color: 'var(--gh-fg-2)' }}>test orphan::switch_orphan ... </span><span style={{ color: REV.addFg }}>ok</span></TermLine>
    <div style={{ height: 4 }} />
    <TermLine><span style={{ color: REV.addFg }}>test result: ok.</span><span style={{ color: 'var(--gh-fg-3)' }}> 3 passed; 0 failed; finished in 0.02s</span></TermLine>
    <div style={{ height: 8 }} />
    <div style={{ display: 'flex' }}>
      <TermPrompt branch="feat/worktree-pane" cmd="" />
      <span style={{ width: 8, height: 15, background: 'var(--gh-fg-1)', marginLeft: 2,
        animation: 'gh-blink 1.1s steps(1) infinite' }} />
    </div>
  </div>
);

// tmux status line — session block on the left, context on the right. No window list.
const TmuxStatus = ({ view, diff, term }) => (
  <div style={{ height: 24, flex: '0 0 auto', display: 'flex', alignItems: 'stretch',
    fontFamily: 'var(--gh-font-mono)', fontSize: 11.5,
    borderTop: '1px solid var(--gh-line-2)', background: 'var(--gh-bg-2)' }}>
    <span style={{ background: 'var(--gh-success)', color: '#0a0a0b', fontWeight: 700,
      padding: '0 11px', display: 'inline-flex', alignItems: 'center', letterSpacing: '0.01em' }}>
      gh-viewer
    </span>
    <span style={{ padding: '0 11px', display: 'inline-flex', alignItems: 'center',
      color: 'var(--gh-fg-3)' }}>
      {view.type === 'pr' ? `#${diff && view.num} review` : 'zsh'}
    </span>
    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'stretch' }}>
      <span style={{ padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 8,
        color: 'var(--gh-fg-3)' }}>
        {view.type === 'pr' ? (
          <>
            <span style={{ color: 'var(--gh-fg-2)' }}>{diff.head}</span>
            <span style={{ color: REV.addFg }}>+{diff.summary.additions}</span>
            <span style={{ color: REV.delFg }}>−{diff.summary.deletions}</span>
          </>
        ) : (
          <span style={{ color: 'var(--gh-fg-2)' }}>{term ? term.cwd : '~'}</span>
        )}
      </span>
      <span style={{ background: 'var(--gh-success)', color: '#0a0a0b', fontWeight: 700,
        padding: '0 11px', display: 'inline-flex', alignItems: 'center' }}>05:20</span>
    </span>
  </div>
);

// --- Main window -----------------------------------------------------------

const DesktopReviewer = () => {
  const prs = SAMPLE_PRS;
  const [decisions, setDecisions] = React.useState({});
  const [terms, setTerms] = React.useState([
    { id: 't1', shell: 'zsh', cwd: '~/gh-viewer' },
  ]);
  const [termSeq, setTermSeq] = React.useState(2);
  const [view, setView] = React.useState({ type: 'pr', id: prs[0].id, num: prs[0].num });

  const pr = prs.find(p => p.id === view.id) || prs[0];
  const diff = getDiff(pr.num);
  const term = view.type === 'term' ? terms.find(t => t.id === view.id) : null;
  const setDecided = (d) => setDecisions(prev => ({ ...prev, [pr.id]: prev[pr.id] === d ? null : d }));

  const selectPr = (id) => { const p = prs.find(x => x.id === id); setView({ type: 'pr', id, num: p.num }); };
  const selectTerm = (id) => setView({ type: 'term', id });
  const addTerm = () => {
    const id = `t${termSeq}`;
    setTerms(prev => [...prev, { id, shell: 'zsh', cwd: '~/gh-viewer' }]);
    setTermSeq(n => n + 1);
    setView({ type: 'term', id });
  };

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
          <ITerminal size={14} style={{ color: 'var(--gh-fg-3)' }} />
          <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 12.5, color: 'var(--gh-fg-2)' }}>
            noumair/gh-viewer
          </span>
          <span style={{ color: 'var(--gh-fg-4)' }}>·</span>
          <span style={{ fontSize: 12.5, color: 'var(--gh-fg-3)' }}>reviewer</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="gh-btn" style={{ width: 28, height: 28, borderRadius: 6, color: 'var(--gh-fg-3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><IRefresh size={14} /></button>
          <button className="gh-btn" style={{ width: 28, height: 28, borderRadius: 6, color: 'var(--gh-fg-3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><IDots size={16} /></button>
        </div>
      </div>
      {/* Body: left grouped sidebar + right content pane (tmux split) */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left pane: PRs grouped by repo + terminal section */}
        <ReviewerSidebar prs={prs} view={view}
          onSelectPr={selectPr} terms={terms} onSelectTerm={selectTerm} onAddTerm={addTerm} />
        {/* Right pane: diff or terminal */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          boxShadow: 'inset 0 0 0 1px rgba(110,196,138,0.22)' }}>
          {view.type === 'pr' ? (
            <>
              <PaneTitle name={`diff · #${pr.num}`} active={true} extra={`${diff.summary.files} files`} />
              <PRHeader pr={pr} diff={diff} decided={decisions[pr.id]} setDecided={setDecided} />
              <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', background: 'var(--gh-bg-1)' }}>
                {diff.files.map((f, i) => <FileDiff key={i} file={f} />)}
                <div style={{ padding: '14px 18px', textAlign: 'center', fontSize: 11,
                  color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>
                  ~ end of diff ~
                </div>
              </div>
            </>
          ) : (
            <>
              <PaneTitle name={`zsh · ${term ? term.cwd : '~'}`} active={true} extra="—" />
              <TerminalPane tab={term} />
            </>
          )}
        </div>
      </div>
      {/* tmux status line */}
      <TmuxStatus view={view} diff={diff} term={term} />
    </div>
  );
};

Object.assign(window, {
  DesktopReviewer,
  FileDiff, PRHeader, PRListRow, DiffLine, PaneTitle,
  REV, ciMeta, stateBadge, statusGlyph,
});
