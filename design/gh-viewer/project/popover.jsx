// popover.jsx — three variations of the menubar PR popover.

const POPOVER_W = 380;
const POPOVER_H = 540;

// Tiny helpers ---------------------------------------------------------------

const ciDot = (ci) => {
  if (ci === 'ok') return <span className="gh-dot ok" />;
  if (ci === 'fail') return <span className="gh-dot bad" />;
  if (ci === 'running') return <span className="gh-dot warn" />;
  return <span className="gh-dot idle" />;
};

const stateLabel = {
  review: 'Review requested',
  assigned: 'Assigned',
  mention: 'Mentioned',
  yours: 'Your PRs',
};

const Avatar = ({ letter, size = 22 }) => (
  <span style={{
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(180deg, #3a3a3f 0%, #28282d 100%)',
    border: '1px solid var(--gh-line-2)',
    color: 'var(--gh-fg-2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 600, letterSpacing: '0.02em',
    flex: '0 0 auto',
  }}>{letter}</span>
);

// ---------------------------------------------------------------------------
// Frame: a faux mac menubar wallpaper context that holds the popover anchored
// under a menubar branch icon, so the popover reads as a real top-bar app.

const PopoverFrame = ({ children, label }) => (
  <div className="gh gh-wallpaper" style={{
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    fontFamily: 'var(--gh-font-ui)',
  }}>
    {/* macOS menubar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 12px', gap: 14,
      background: 'rgba(10,10,12,0.55)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      zIndex: 5,
    }}>
      <span style={{ color: 'var(--gh-fg-1)', display: 'inline-flex', alignItems: 'center' }}>
        <IBranch size={14} stroke={1.6} />
      </span>
      <span style={{ color: 'var(--gh-fg-2)' }}>✳</span>
      <span style={{ color: 'var(--gh-fg-2)', fontFamily: 'var(--gh-font-mono)', fontSize: 11 }}>05:20</span>
    </div>

    {/* Anchor caret pointing down at popover from menubar branch icon */}
    <div style={{
      position: 'absolute', top: 24, right: 'calc(100% - 80px)',
      width: 0, height: 0,
    }} />

    {/* Popover */}
    <div style={{
      position: 'absolute',
      top: 38, left: 14, right: 14, bottom: 14,
    }}>
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// macOS notification — appears on the desktop, NOT inside the popover. Renders
// in the top-right of the wallpaper just below the menubar.

const MacNotification = ({
  app = 'Git Manager',
  title = 'New review requested',
  body = 'marina · #482 Worktree manager: support orphan branches',
  age = 'now',
}) => (
  <div style={{
    position: 'absolute', top: 38, right: 14,
    width: 344,
    background: 'rgba(36,36,38,0.78)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    boxShadow: '0 16px 40px -8px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)',
    padding: 12,
    display: 'flex', gap: 10,
    fontFamily: 'var(--gh-font-ui)',
    color: 'var(--gh-fg-1)',
    zIndex: 10,
  }}>
    {/* App icon */}
    <div style={{
      width: 38, height: 38, borderRadius: 8,
      background: 'linear-gradient(180deg, #2a2a2e 0%, #1a1a1d 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--gh-fg-1)',
      flex: '0 0 auto',
    }}>
      <IBranch size={20} stroke={1.6} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
        fontSize: 11, color: 'var(--gh-fg-3)',
      }}>
        <span style={{ fontWeight: 500, color: 'var(--gh-fg-2)' }}>{app}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--gh-font-mono)' }}>{age}</span>
      </div>
      <div style={{
        marginTop: 2, fontSize: 13, fontWeight: 600, color: 'var(--gh-fg-1)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{title}</div>
      <div style={{
        marginTop: 1, fontSize: 12, color: 'var(--gh-fg-2)', lineHeight: 1.35,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{body}</div>
    </div>
  </div>
);

// Variant of PopoverFrame that shows a notification and no popover content
const NotificationFrame = () => (
  <div className="gh gh-wallpaper" style={{
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    fontFamily: 'var(--gh-font-ui)',
  }}>
    {/* macOS menubar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 12px', gap: 14,
      background: 'rgba(10,10,12,0.55)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      zIndex: 5,
    }}>
      <span style={{ color: 'var(--gh-fg-1)', display: 'inline-flex', alignItems: 'center' }}>
        <IBranch size={14} stroke={1.6} />
      </span>
      <span style={{ color: 'var(--gh-fg-2)' }}>✳</span>
      <span style={{ color: 'var(--gh-fg-2)', fontFamily: 'var(--gh-font-mono)', fontSize: 11 }}>05:20</span>
    </div>
    <MacNotification />
    {/* Hint text below */}
    <div style={{
      position: 'absolute', top: 200, left: 0, right: 0,
      textAlign: 'center', fontSize: 11, color: 'var(--gh-fg-4)',
      fontFamily: 'var(--gh-font-mono)', letterSpacing: '0.04em',
    }}>
      desktop notification · click to open the popover
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Popover A — "Refined" — current direction polished. Single list, subtle
// state pills, CI dots, calmer typography. Footer keeps the "0 open / time".

const PRRowA = ({ pr }) => (
  <div className="gh-row" style={{
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '10px 14px',
    borderBottom: '1px solid var(--gh-line-1)',
    cursor: 'pointer',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <Avatar letter={pr.avatar} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: 'var(--gh-fg-3)',
      }}>
        <span style={{ fontFamily: 'var(--gh-font-mono)' }}>{pr.repo.split('/')[1]}</span>
        <span>·</span>
        <span style={{ fontFamily: 'var(--gh-font-mono)' }}>#{pr.num}</span>
        <span style={{
          marginLeft: 'auto', display: 'inline-flex', alignItems: 'center',
          flex: '0 0 auto',
        }}>
          {ciDot(pr.ci)}
        </span>
      </div>
      <div style={{
        marginTop: 2, fontSize: 13, lineHeight: 1.35,
        color: 'var(--gh-fg-1)', fontWeight: 500,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{pr.title}</div>
      <div style={{
        marginTop: 6, display: 'flex', gap: 6, alignItems: 'center',
        fontSize: 11, color: 'var(--gh-fg-3)', flexWrap: 'wrap',
      }}>
        <span style={{
          padding: '1.5px 7px', borderRadius: 999,
          background: pr.state === 'yours' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
          border: '1px solid var(--gh-line-1)',
          color: pr.state === 'yours' ? 'var(--gh-fg-2)' : 'var(--gh-fg-3)',
        }}>{stateLabel[pr.state]}</span>
        {pr.comments > 0 && <span>💬 {pr.comments}</span>}
      </div>
    </div>
  </div>
);

const PopoverA = () => (
  <PopoverFrame>
    <div style={{
      width: '100%', height: '100%',
      background: 'rgba(20,20,22,0.78)',
      backdropFilter: 'blur(40px) saturate(140%)',
      WebkitBackdropFilter: 'blur(40px) saturate(140%)',
      border: '1px solid var(--gh-line-2)',
      borderRadius: 14,
      boxShadow: 'var(--gh-shadow-popover)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        borderBottom: '1px solid var(--gh-line-1)',
      }}>
        <IBranch size={14} stroke={1.6} style={{ color: 'var(--gh-fg-2)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gh-fg-1)' }}>Pull requests</span>
        <span style={{
          marginLeft: 6, fontSize: 11, color: 'var(--gh-fg-3)',
          fontFamily: 'var(--gh-font-mono)',
        }}>5</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="gh-btn" style={{
            width: 26, height: 26, borderRadius: 6, color: 'var(--gh-fg-3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}><IRefresh size={14} /></button>
        </div>
      </div>
      {/* List — only Review requested + Your PRs, in that order */}
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {(() => {
          const review = SAMPLE_PRS.filter(p => p.state === 'review');
          const yours = SAMPLE_PRS.filter(p => p.state === 'yours');
          return [...review, ...yours].map(pr => <PRRowA key={pr.id} pr={pr} />);
        })()}
      </div>
    </div>
  </PopoverFrame>
);

// ---------------------------------------------------------------------------
// Popover B — "Grouped" — sections by relationship (Review requested, Yours,
// Mentioned, Assigned). Compact rows, sticky group headers, filter chips.

const PRRowB = ({ pr }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 14px',
    cursor: 'pointer',
    borderRadius: 0,
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    {ciDot(pr.ci)}
    <Avatar letter={pr.avatar} size={18} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 12.5, color: 'var(--gh-fg-1)', fontWeight: 500,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{pr.title}</div>
      <div style={{
        marginTop: 1, fontSize: 11, color: 'var(--gh-fg-3)',
        fontFamily: 'var(--gh-font-mono)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {pr.repo.split('/')[1]} · #{pr.num} · {pr.author}
      </div>
    </div>
    <span style={{ fontSize: 11, color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)', flex: '0 0 auto' }}>{pr.age}</span>
  </div>
);

const Group = ({ title, count, children, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div>
      <button className="gh-btn" onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
        color: 'var(--gh-fg-3)', textTransform: 'uppercase',
        position: 'sticky', top: 0,
        background: 'rgba(20,20,22,0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid var(--gh-line-1)',
        borderBottom: '1px solid var(--gh-line-1)',
        zIndex: 1,
      }}>
        <span style={{ color: 'var(--gh-fg-3)', display: 'inline-flex', transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform .15s' }}>
          <IChevD size={10} stroke={2} />
        </span>
        <span>{title}</span>
        <span style={{ fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-4)', letterSpacing: 0 }}>{count}</span>
      </button>
      {open && children}
    </div>
  );
};

const PopoverB = () => {
  const groups = [
    { key: 'review', title: 'Review requested' },
    { key: 'yours', title: 'Your PRs' },
    { key: 'mention', title: 'Mentioned' },
    { key: 'assigned', title: 'Assigned' },
  ];
  return (
    <PopoverFrame>
      <div style={{
        width: '100%', height: '100%',
        background: 'rgba(20,20,22,0.78)',
        backdropFilter: 'blur(40px) saturate(140%)',
        WebkitBackdropFilter: 'blur(40px) saturate(140%)',
        border: '1px solid var(--gh-line-2)',
        borderRadius: 14,
        boxShadow: 'var(--gh-shadow-popover)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px',
          borderBottom: '1px solid var(--gh-line-1)',
        }}>
          <IBranch size={14} stroke={1.6} style={{ color: 'var(--gh-fg-2)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Pull requests</span>
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--gh-line-1)',
            borderRadius: 6, padding: '0 8px', gap: 6,
            height: 24,
          }}>
            <ISearch size={12} style={{ color: 'var(--gh-fg-3)' }} />
            <input placeholder="Filter" style={{
              background: 'transparent', border: 0, outline: 'none', color: 'var(--gh-fg-1)',
              fontSize: 12, width: 80, fontFamily: 'inherit',
            }} />
          </div>
        </div>

        <div className="gh-scroll" style={{ flex: 1, overflow: 'auto' }}>
          {groups.map(g => {
            const items = SAMPLE_PRS.filter(p => p.state === g.key);
            if (!items.length) return null;
            return (
              <Group key={g.key} title={g.title} count={items.length} defaultOpen={g.key === 'review' || g.key === 'yours'}>
                {items.map(pr => <PRRowB key={pr.id} pr={pr} />)}
              </Group>
            );
          })}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px',
          borderTop: '1px solid var(--gh-line-1)',
          background: 'rgba(0,0,0,0.2)',
          fontSize: 11, color: 'var(--gh-fg-3)',
        }}>
          <span style={{ fontFamily: 'var(--gh-font-mono)' }}>{SAMPLE_PRS.length} open</span>
          <span style={{ width: 1, height: 12, background: 'var(--gh-line-2)' }} />
          <span style={{ fontFamily: 'var(--gh-font-mono)', marginLeft: 'auto' }}>updated 05:20</span>
        </div>
      </div>
    </PopoverFrame>
  );
};

// ---------------------------------------------------------------------------
// Popover C — "Mono / dense" — terminal-leaning. Single list, monospace
// metadata, tabs across the top, very compact. CI status as glyph, no avatar.

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{
    display: 'flex', gap: 2,
    padding: '4px',
    background: 'rgba(0,0,0,0.25)',
    borderBottom: '1px solid var(--gh-line-1)',
  }}>
    {tabs.map(t => (
      <button key={t.key} className="gh-btn" onClick={() => onChange(t.key)} style={{
        padding: '5px 9px',
        borderRadius: 5,
        fontSize: 11, fontWeight: 500,
        color: active === t.key ? 'var(--gh-fg-1)' : 'var(--gh-fg-3)',
        background: active === t.key ? 'rgba(255,255,255,0.06)' : 'transparent',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <span>{t.label}</span>
        <span style={{
          fontFamily: 'var(--gh-font-mono)',
          color: active === t.key ? 'var(--gh-fg-2)' : 'var(--gh-fg-4)',
          fontSize: 10.5,
        }}>{t.count}</span>
      </button>
    ))}
  </div>
);

const PRRowC = ({ pr }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '14px auto 1fr auto',
    alignItems: 'center', gap: 8,
    padding: '6px 14px',
    fontSize: 12,
    cursor: 'pointer',
    borderBottom: '1px dashed rgba(255,255,255,0.04)',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    {ciDot(pr.ci)}
    <span style={{
      fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-3)',
      fontSize: 11, letterSpacing: '0.02em',
    }}>#{pr.num}</span>
    <span style={{
      color: 'var(--gh-fg-1)',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    }}>{pr.title}</span>
    <span style={{
      fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-3)',
      fontSize: 10.5,
    }}>{pr.age}</span>
  </div>
);

const PopoverC = () => {
  const [tab, setTab] = React.useState('all');
  const filterFn = tab === 'all' ? () => true
                 : tab === 'review' ? p => p.state === 'review'
                 : tab === 'yours' ? p => p.state === 'yours'
                 : p => p.state === 'mention' || p.state === 'assigned';
  const visible = SAMPLE_PRS.filter(filterFn);
  return (
    <PopoverFrame>
      <div style={{
        width: '100%', height: '100%',
        background: 'rgba(16,16,18,0.85)',
        backdropFilter: 'blur(40px) saturate(140%)',
        WebkitBackdropFilter: 'blur(40px) saturate(140%)',
        border: '1px solid var(--gh-line-2)',
        borderRadius: 12,
        boxShadow: 'var(--gh-shadow-popover)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: 'var(--gh-font-mono)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
        }}>
          <span style={{
            color: 'var(--gh-fg-2)', fontSize: 12,
          }}>~/prs</span>
          <span style={{ color: 'var(--gh-fg-4)' }}>·</span>
          <span style={{ color: 'var(--gh-fg-3)', fontSize: 11 }}>{SAMPLE_PRS.length} open</span>
          <span style={{
            marginLeft: 'auto', color: 'var(--gh-fg-4)', fontSize: 11,
          }}>05:20</span>
        </div>
        <TabBar
          tabs={[
            { key: 'all', label: 'All', count: SAMPLE_PRS.length },
            { key: 'review', label: 'Review', count: SAMPLE_PRS.filter(p => p.state === 'review').length },
            { key: 'yours', label: 'Yours', count: SAMPLE_PRS.filter(p => p.state === 'yours').length },
            { key: 'inbox', label: 'Inbox', count: SAMPLE_PRS.filter(p => p.state === 'mention' || p.state === 'assigned').length },
          ]}
          active={tab} onChange={setTab}
        />
        <div className="gh-scroll" style={{ flex: 1, overflow: 'auto' }}>
          {visible.map(pr => <PRRowC key={pr.id} pr={pr} />)}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px',
          borderTop: '1px solid var(--gh-line-1)',
          fontSize: 11, color: 'var(--gh-fg-3)',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <span style={{ color: 'var(--gh-success)' }}>●</span>
          <span>{visible.length} shown</span>
          <span style={{ marginLeft: 'auto', color: 'var(--gh-fg-4)' }}>⌘R refresh</span>
          <span style={{ color: 'var(--gh-fg-4)' }}>⌘K filter</span>
        </div>
      </div>
    </PopoverFrame>
  );
};

Object.assign(window, { PopoverA, PopoverB, PopoverC, NotificationFrame, POPOVER_W, POPOVER_H });
