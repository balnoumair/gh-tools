// popover-claude.jsx — the menubar PR popover, restyled to the cool-dark
// Style-B language (CC_THEME tokens, indigo accent, rounded rows, repo groups
// that mirror the Review app). Also a matching desktop notification.

const ccDotColor = (ci) => ({
  ok: 'var(--gh-success)', fail: 'var(--gh-danger)', running: 'var(--gh-warn)', idle: 'var(--gh-fg-4)',
}[ci] || 'var(--gh-fg-4)');

const ccStateLabel = { review: 'Review requested', yours: 'Yours', mention: 'Mentioned', assigned: 'Assigned' };

// Menubar accent glyph — same mark as the app title bar.
const CCMenuMark = ({ size = 18 }) => (
  <span style={{ width: size, height: size, borderRadius: 6, background: 'var(--cc-accent-soft)',
    border: '1px solid var(--cc-accent-line)', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', color: 'var(--cc-accent)', flex: '0 0 auto' }}>
    <IGitPullRequest size={Math.round(size * 0.62)} stroke={1.8} />
  </span>
);

// Wallpaper + menubar frame, themed.
const CCWallpaper = ({ children }) => (
  <div className="gh" style={{ ...CC_THEME, width: '100%', height: '100%', position: 'relative',
    overflow: 'hidden', fontFamily: 'var(--cc-sans)',
    backgroundImage:
      'radial-gradient(900px 600px at 25% 15%, #1b1f2b 0%, transparent 55%),' +
      'radial-gradient(800px 600px at 85% 80%, #181a24 0%, transparent 60%),' +
      'linear-gradient(180deg, #0b0c10 0%, #101218 100%)' }}>
    {/* menubar */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px', gap: 13,
      background: 'rgba(8,9,12,0.55)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 5 }}>
      <CCMenuMark size={17} />
      <span style={{ color: 'var(--gh-fg-3)' }}>✳</span>
      <span style={{ color: 'var(--gh-fg-2)', fontFamily: 'var(--gh-font-mono)', fontSize: 11 }}>05:20</span>
    </div>
    {children}
  </div>
);

const CCSeg = ({ options, value, onChange }) => (
  <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--gh-line-2)', borderRadius: 8, padding: 2, gap: 2 }}>
    {options.map(o => {
      const active = value === o.v;
      return (
        <button key={o.v} className="gh-btn" onClick={() => onChange(o.v)} style={{
          height: 22, padding: '0 9px', borderRadius: 6, fontFamily: 'var(--cc-sans)',
          fontSize: 11, fontWeight: 500,
          background: active ? 'var(--cc-accent-soft)' : 'transparent',
          color: active ? 'var(--gh-fg-1)' : 'var(--gh-fg-3)',
          boxShadow: active ? 'inset 0 0 0 1px var(--cc-accent-line)' : 'none' }}>
          {o.l}<span style={{ marginLeft: 5, color: active ? 'var(--cc-accent)' : 'var(--gh-fg-4)',
            fontFamily: 'var(--gh-font-mono)', fontSize: 10 }}>{o.c}</span>
        </button>
      );
    })}
  </div>
);

// Repo group label inside the popover.
const CCPopGroup = ({ name, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 10px 2px', padding: '2px 2px' }}>
    <RootGlyph name={name} size={17} />
    <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 12, fontWeight: 600, color: 'var(--gh-fg-2)' }}>{name}</span>
    <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, color: 'var(--gh-fg-4)' }}>{count}</span>
  </div>
);

// Uniform-height PR row (rounded pill).
const CCPopRow = ({ pr }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, boxSizing: 'border-box',
    margin: '1px 8px', padding: '8px 10px', borderRadius: 10, cursor: 'pointer' }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ccDotColor(pr.ci), flex: '0 0 auto' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 11, color: 'var(--gh-fg-4)', flex: '0 0 auto' }}>#{pr.num}</span>
        <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 12.5, color: 'var(--gh-fg-1)', fontWeight: 500,
          lineHeight: 1.32, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {pr.title}
        </span>
      </div>
      <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--gh-font-mono)', fontSize: 10.5, color: 'var(--gh-fg-4)' }}>
        <span style={{ color: stateBadge[pr.state]?.tone || 'var(--gh-fg-3)' }}>{ccStateLabel[pr.state] || pr.state}</span>
        <span>·</span><span>{pr.author}</span><span>·</span><span>{pr.age}</span>
      </div>
    </div>
  </div>
);

const CCPopover = () => {
  const [filter, setFilter] = React.useState('all');
  const match = filter === 'all' ? () => true
    : filter === 'review' ? p => p.state === 'review'
    : p => p.state === 'yours';
  const visible = SAMPLE_PRS.filter(match);
  // group by repo, in FUSION_ROOTS order
  const groups = FUSION_ROOTS
    .map(r => ({ name: r.name, prs: visible.filter(p => p.repo.split('/')[1] === r.name) }))
    .filter(g => g.prs.length);

  return (
    <CCWallpaper>
      <div style={{ position: 'absolute', top: 38, left: 14, right: 14, bottom: 14 }}>
        <div style={{ width: '100%', height: '100%',
          background: 'rgba(22,23,28,0.82)', backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid var(--gh-line-2)', borderRadius: 16,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 13px 10px' }}>
            <CCMenuMark size={20} />
            <span style={{ fontFamily: 'var(--cc-sans)', fontSize: 13.5, fontWeight: 600,
              color: 'var(--gh-fg-1)', letterSpacing: '-0.01em' }}>Pull requests</span>
            <span style={{ fontFamily: 'var(--gh-font-mono)', fontSize: 11, color: 'var(--gh-fg-4)' }}>{SAMPLE_PRS.length}</span>
            <button className="gh-btn" title="Refresh" style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 7,
              color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><IRefresh size={14} /></button>
          </div>
          {/* Filter */}
          <div style={{ padding: '0 13px 10px' }}>
            <CCSeg value={filter} onChange={setFilter} options={[
              { v: 'all', l: 'All', c: SAMPLE_PRS.length },
              { v: 'review', l: 'Review', c: SAMPLE_PRS.filter(p => p.state === 'review').length },
              { v: 'yours', l: 'Yours', c: SAMPLE_PRS.filter(p => p.state === 'yours').length },
            ]} />
          </div>
          {/* List */}
          <div className="gh-scroll" style={{ flex: 1, overflow: 'auto',
            borderTop: '1px solid var(--gh-line-1)', paddingBottom: 6 }}>
            {groups.map(g => (
              <div key={g.name}>
                <CCPopGroup name={g.name} count={g.prs.length} />
                {g.prs.map(pr => <CCPopRow key={pr.id} pr={pr} />)}
              </div>
            ))}
            {groups.length === 0 && (
              <div style={{ padding: '28px 14px', textAlign: 'center', fontFamily: 'var(--gh-font-mono)',
                fontSize: 12, color: 'var(--gh-fg-4)' }}>Nothing here — you're all caught up.</div>
            )}
          </div>
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 13px',
            borderTop: '1px solid var(--gh-line-1)', background: 'rgba(0,0,0,0.18)',
            fontFamily: 'var(--gh-font-mono)', fontSize: 11, color: 'var(--gh-fg-4)' }}>
            <span style={{ color: 'var(--gh-fg-3)' }}>{visible.length} shown</span>
            <span style={{ marginLeft: 'auto' }}>updated 05:20</span>
            <span style={{ width: 1, height: 11, background: 'var(--gh-line-2)' }} />
            <span>Open Review</span>
          </div>
        </div>
      </div>
    </CCWallpaper>
  );
};

// Matching desktop notification.
const CCNotificationFrame = () => (
  <CCWallpaper>
    <div style={{ position: 'absolute', top: 38, right: 14, width: 346,
      background: 'rgba(26,28,34,0.8)', backdropFilter: 'blur(40px) saturate(160%)',
      WebkitBackdropFilter: 'blur(40px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16,
      boxShadow: '0 18px 44px -8px rgba(0,0,0,0.58), 0 2px 6px rgba(0,0,0,0.4)',
      padding: 13, display: 'flex', gap: 11, color: 'var(--gh-fg-1)', zIndex: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, flex: '0 0 auto',
        background: 'var(--cc-accent-soft)', border: '1px solid var(--cc-accent-line)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cc-accent)' }}>
        <IGitPullRequest size={21} stroke={1.7} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 11, color: 'var(--gh-fg-3)' }}>
          <span style={{ fontWeight: 600, color: 'var(--gh-fg-2)', fontFamily: 'var(--cc-sans)' }}>Review</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono)' }}>now</span>
        </div>
        <div style={{ marginTop: 2, fontFamily: 'var(--cc-sans)', fontSize: 13.5, fontWeight: 600,
          color: 'var(--gh-fg-1)' }}>New review requested</div>
        <div style={{ marginTop: 2, fontSize: 12, color: 'var(--gh-fg-2)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          <span style={{ fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-3)' }}>marina · #482</span>{' '}
          Worktree manager: support orphan branches
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center',
      fontFamily: 'var(--gh-font-mono)', fontSize: 11, color: 'var(--gh-fg-4)', letterSpacing: '0.04em' }}>
      desktop notification · click to open the popover
    </div>
  </CCWallpaper>
);

Object.assign(window, { CCPopover, CCNotificationFrame });
