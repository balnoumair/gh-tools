// workspace.jsx — Tiny single-pane "Git Manager" app.
// Per user feedback: workspace is now ONE narrow sidebar/window. Sections
// stack vertically. Worktrees first-class with inline editor strip. Stash
// lives as a collapsible section. No center pane, no commits feed, no funnel.

const editors = [
  { key: 'cursor', label: 'Cursor' },
  { key: 'claude', label: 'Claude Code' },
  { key: 'codex',  label: 'Codex' },
  { key: 'zed',    label: 'Zed' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'finder', label: 'Finder' },
];

// ---------------------------------------------------------------------------
// Section header used throughout the tiny app.
const SectionHeader = ({ title, count, open, onToggle, action }) => (
  <div className="gh-btn" role="button" onClick={onToggle} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 12px', cursor: 'pointer',
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--gh-fg-3)',
    borderTop: '1px solid var(--gh-line-1)',
    background: 'rgba(255,255,255,0.015)',
  }}>
    {onToggle && (
      <span style={{ display: 'inline-flex', transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform .15s', color: 'var(--gh-fg-4)' }}>
        <IChevD size={9} stroke={2} />
      </span>
    )}
    <span>{title}</span>
    {count != null && <span style={{ fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-4)', letterSpacing: 0 }}>{count}</span>}
    {action && <span style={{ marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>{action}</span>}
  </div>
);

const IconBtn = ({ children, title, danger, onClick }) => (
  <button className="gh-btn" title={title} onClick={onClick} style={{
    width: 22, height: 22, borderRadius: 5,
    color: 'var(--gh-fg-3)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flex: '0 0 auto',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? 'rgba(224,122,122,0.12)' : 'rgba(255,255,255,0.07)';
      e.currentTarget.style.color = danger ? 'var(--gh-danger)' : 'var(--gh-fg-1)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--gh-fg-3)';
    }}>
    {children}
  </button>
);

// ---------------------------------------------------------------------------
// Worktree row — title + meta on row 1, editor strip + remove on row 2.
// When dirty, a Commit chip toggles an inline composer.
const menuItem = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '6px 9px', borderRadius: 4,
  fontSize: 12, color: 'var(--gh-fg-1)',
  width: '100%', textAlign: 'left',
};
const menuMeta = {
  marginLeft: 'auto',
  fontFamily: 'var(--gh-font-mono)', fontSize: 10.5,
  color: 'var(--gh-fg-3)',
};
// Unified "Open with" split-button, Codex-style: primary opens last-used,
// chevron opens a dropdown listing all editor targets.
const OpenWithSplit = () => {
  const [pick, setPick] = React.useState('cursor');
  const [open, setOpen] = React.useState(false);
  const current = editors.find(e => e.key === pick) || editors[0];
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button title={`Open in ${current.label}`} className="gh-btn" style={{
        height: 24, padding: '0 8px 0 7px',
        borderRadius: '5px 0 0 5px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--gh-line-1)',
        borderRight: 'none',
        color: 'var(--gh-fg-1)',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11.5,
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
        <EditorGlyph name={current.key} size={12} />
        <span>Open</span>
      </button>
      <button title="Choose editor" className="gh-btn" onClick={() => setOpen(o => !o)} style={{
        height: 24, width: 20, borderRadius: '0 5px 5px 0',
        background: open ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)',
        border: '1px solid var(--gh-line-1)',
        color: 'var(--gh-fg-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IChevD size={9} stroke={2} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 28, left: 0, zIndex: 30,
          minWidth: 160,
          background: 'rgba(28,28,32,0.98)',
          border: '1px solid var(--gh-line-2)',
          borderRadius: 7,
          boxShadow: '0 10px 28px rgba(0,0,0,0.55)',
          padding: 4,
        }}>
          {editors.map(ed => (
            <button key={ed.key} className="gh-btn"
              onClick={() => { setPick(ed.key); setOpen(false); }}
              style={{
                ...menuItem,
                background: ed.key === pick ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = ed.key === pick ? 'rgba(255,255,255,0.06)' : 'transparent'}>
              <EditorGlyph name={ed.key} size={12} />
              <span>{ed.label}</span>
              {ed.key === pick && <span style={menuMeta}>default</span>}
            </button>
          ))}
        </div>
      )}
    </span>
  );
};

const TinyWorktreeRow = ({ w, last }) => {
  const name = w.path.split('/').pop();
  const [composing, setComposing] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div style={{
      padding: '10px 12px',
      borderBottom: last ? 'none' : '1px solid var(--gh-line-1)',
      background: composing ? 'rgba(255,255,255,0.02)' : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IFolder size={12} style={{ color: 'var(--gh-fg-3)', flex: '0 0 auto' }} />
        <span style={{
          fontSize: 12.5, color: 'var(--gh-fg-1)',
          fontFamily: 'var(--gh-font-mono)', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          flex: 1, minWidth: 0,
        }}>{name}</span>
        {w.primary && <span style={{
          fontSize: 9, padding: '1px 5px', borderRadius: 3,
          background: 'rgba(255,255,255,0.06)', color: 'var(--gh-fg-3)',
          letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600,
          flex: '0 0 auto',
        }}>primary</span>}
      </div>
      <div style={{
        marginTop: 4, paddingLeft: 20,
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, color: 'var(--gh-fg-3)',
        fontFamily: 'var(--gh-font-mono)',
      }}>
        <IBranch size={9} stroke={1.6} />
        <span style={{
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          flex: 1, minWidth: 0,
        }}>{w.branch}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
          <span className={`gh-dot ${w.dirty ? 'warn' : 'ok'}`} style={{ width: 6, height: 6 }} />
          {w.dirty ? 'modified' : 'clean'}
        </span>
        <span style={{ flex: '0 0 auto' }}>↑{w.ahead} ↓{w.behind}</span>
      </div>
      {/* Open-with split button + status + overflow */}
      <div style={{
        marginTop: 8, paddingLeft: 20,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <OpenWithSplit />
        <span style={{ flex: 1 }} />
        {/* Status hints — quiet, non-button */}
        {(w.dirty || w.behind > 0) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, color: 'var(--gh-fg-3)',
            fontFamily: 'var(--gh-font-mono)',
          }}>
            {w.dirty && <span>4 uncommitted</span>}
            {w.dirty && w.behind > 0 && <span style={{ color: 'var(--gh-fg-4)' }}>·</span>}
            {w.behind > 0 && <span>↓{w.behind}</span>}
          </span>
        )}
        {/* Single overflow menu — Commit / Sync / Remove */}
        <button title="Actions" className="gh-btn"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            height: 24, width: 26, borderRadius: 5,
            background: menuOpen ? 'rgba(255,255,255,0.10)' : 'transparent',
            color: 'var(--gh-fg-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}
          onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}>
          <IDots size={13} />
        </button>
      </div>
      {menuOpen && (
        <div style={{
          marginTop: 6, marginLeft: 20,
          background: 'rgba(28,28,32,0.96)',
          border: '1px solid var(--gh-line-2)',
          borderRadius: 7,
          boxShadow: '0 8px 22px rgba(0,0,0,0.5)',
          padding: 4,
          display: 'flex', flexDirection: 'column', gap: 1,
          fontSize: 12,
        }}>
          {w.dirty && (
            <button className="gh-btn" onClick={() => { setMenuOpen(false); setComposing(true); }}
              style={menuItem}>
              <IGitCommit size={12} /> Commit changes
              <span style={menuMeta}>4 staged</span>
            </button>
          )}
          {w.behind > 0 && (
            <button className="gh-btn" onClick={() => setMenuOpen(false)} style={menuItem}>
              <IGitMerge size={12} /> Merge main → {w.branch.split('/').pop()}
              <span style={menuMeta}>↓{w.behind}</span>
            </button>
          )}
          <button className="gh-btn" onClick={() => setMenuOpen(false)} style={menuItem}>
            <IRefresh size={12} /> Pull
          </button>
          <button className="gh-btn" onClick={() => setMenuOpen(false)} style={menuItem}>
            <IUpload size={12} /> Push
          </button>
          <div style={{ height: 1, background: 'var(--gh-line-1)', margin: '3px 0' }} />
          {!w.primary && (
            <button className="gh-btn" onClick={() => setMenuOpen(false)} style={{ ...menuItem, color: 'var(--gh-danger)' }}>
              <ITrash size={12} /> Remove worktree
            </button>
          )}
        </div>
      )}

      {/* Inline commit composer — only when toggled on a dirty worktree */}
      {composing && (
        <div style={{
          marginTop: 8, marginLeft: 20,
          background: 'var(--gh-bg-2)',
          border: '1px solid var(--gh-line-2)',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Commit message…"
            autoFocus
            style={{
              width: '100%', minHeight: 52,
              background: 'transparent', border: 0, outline: 'none',
              color: 'var(--gh-fg-1)', fontSize: 12, lineHeight: 1.4,
              padding: '8px 10px',
              fontFamily: 'var(--gh-font-mono)',
              resize: 'none',
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 8px',
            borderTop: '1px solid var(--gh-line-1)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <span style={{
              fontSize: 10.5, color: 'var(--gh-fg-3)',
              fontFamily: 'var(--gh-font-mono)',
            }}>4 staged · ↑6</span>
            <span style={{ flex: 1 }} />
            <button className="gh-btn" onClick={() => { setComposing(false); setMsg(''); }}
              style={{
                height: 22, padding: '0 8px', borderRadius: 4,
                fontSize: 11, color: 'var(--gh-fg-2)',
              }}>Cancel</button>
            <button className="gh-btn" disabled={!msg.trim()}
              style={{
                height: 22, padding: '0 10px', borderRadius: 4,
                fontSize: 11, fontWeight: 600,
                background: msg.trim() ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)',
                color: msg.trim() ? '#15151a' : 'var(--gh-fg-3)',
                cursor: msg.trim() ? 'pointer' : 'default',
              }}>Commit</button>
            <button className="gh-btn" disabled={!msg.trim()} title="Commit and push"
              style={{
                height: 22, padding: '0 8px', borderRadius: 4,
                fontSize: 11, fontWeight: 500,
                color: msg.trim() ? 'var(--gh-fg-1)' : 'var(--gh-fg-4)',
                border: '1px solid var(--gh-line-2)',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                cursor: msg.trim() ? 'pointer' : 'default',
              }}><IUpload size={10} /> &amp; Push</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Branch row — compact, single line.
const TinyBranchRow = ({ b, current, last }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px',
    borderBottom: last ? 'none' : '1px dashed rgba(255,255,255,0.04)',
    cursor: 'pointer',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: current ? 'var(--gh-fg-1)' : 'transparent',
      border: current ? 'none' : '1px solid var(--gh-line-3)',
      flex: '0 0 auto',
    }} />
    <span style={{
      flex: 1, fontSize: 12, color: current ? 'var(--gh-fg-1)' : 'var(--gh-fg-2)',
      fontFamily: b.name.includes('/') ? 'var(--gh-font-mono)' : 'inherit',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    }}>{b.name}</span>
    {b.pr && <span style={{
      fontSize: 10.5, fontFamily: 'var(--gh-font-mono)',
      color: 'var(--gh-fg-3)',
      display: 'inline-flex', alignItems: 'center', gap: 3,
      flex: '0 0 auto',
    }}>
      <IGitPullRequest size={9} stroke={1.6} />
      {b.pr.num}
    </span>}
    {(b.ahead > 0 || b.behind > 0) && (
      <span style={{
        fontSize: 10.5, color: 'var(--gh-fg-3)',
        fontFamily: 'var(--gh-font-mono)', flex: '0 0 auto',
      }}>
        {b.ahead > 0 ? `↑${b.ahead}` : ''}{b.ahead > 0 && b.behind > 0 ? ' ' : ''}{b.behind > 0 ? `↓${b.behind}` : ''}
      </span>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Repo switcher — Zed-style. A pill in the title bar opens a menubar-style
// panel: search, recent repos (branch + dirty + last opened), active check,
// and an "Open folder…" action.
const RepoMonogram = ({ name, size = 22 }) => (
  <span style={{
    width: size, height: size, borderRadius: 5,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--gh-line-1)',
    color: 'var(--gh-fg-2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--gh-font-mono)', fontSize: Math.round(size * 0.48),
    fontWeight: 600, lineHeight: 1, flex: '0 0 auto',
  }}>{name[0]}</span>
);

const RepoSwitcher = ({ repos, active, onPick }) => {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(q.toLowerCase()) ||
    r.path.toLowerCase().includes(q.toLowerCase()));

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', WebkitAppRegion: 'no-drag' }}>
      {/* Trigger pill */}
      <button className="gh-btn" onClick={() => { setOpen(o => !o); setQ(''); }} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        height: 26, padding: '0 7px 0 6px', borderRadius: 7,
        background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: '1px solid', borderColor: open ? 'var(--gh-line-2)' : 'transparent',
      }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
        <RepoMonogram name={active.name} size={18} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gh-fg-1)' }}>{active.name}</span>
        {active.dirty && <span className="gh-dot warn" style={{ width: 6, height: 6 }} />}
        <span style={{ display: 'inline-flex', color: 'var(--gh-fg-4)' }}><IChevD size={10} stroke={2} /></span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
          width: 312, zIndex: 60,
          background: 'rgba(28,28,32,0.98)',
          border: '1px solid var(--gh-line-2)',
          borderRadius: 10,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 11px',
            borderBottom: '1px solid var(--gh-line-1)',
          }}>
            <ISearch size={13} style={{ color: 'var(--gh-fg-4)' }} />
            <input
              value={q} onChange={e => setQ(e.target.value)} autoFocus
              placeholder="Search repositories…"
              style={{
                flex: 1, background: 'transparent', border: 0, outline: 'none',
                color: 'var(--gh-fg-1)', fontSize: 12.5, fontFamily: 'var(--gh-font-ui)',
              }} />
            <kbd style={{
              fontSize: 10, fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-4)',
              border: '1px solid var(--gh-line-2)', borderRadius: 4, padding: '1px 5px',
            }}>⌘O</kbd>
          </div>

          {/* Recent label */}
          <div style={{
            padding: '8px 12px 4px',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--gh-fg-4)',
          }}>Recent</div>

          {/* Repo list */}
          <div className="gh-scroll" style={{ maxHeight: 296, overflow: 'auto', padding: '0 4px 4px' }}>
            {filtered.map(r => {
              const isActive = r.name === active.name;
              return (
                <button key={r.path} className="gh-btn"
                  onClick={() => { onPick(r); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 8px', borderRadius: 7, textAlign: 'left',
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <RepoMonogram name={r.name} size={28} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 12.5, fontWeight: 600, color: 'var(--gh-fg-1)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{r.name}</span>
                      {r.dirty && <span className="gh-dot warn" style={{ width: 6, height: 6, flex: '0 0 auto' }} />}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginTop: 2,
                      fontSize: 10.5, fontFamily: 'var(--gh-font-mono)', color: 'var(--gh-fg-4)',
                    }}>
                      <IBranch size={9} stroke={1.6} />
                      <span style={{
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150,
                      }}>{r.branch}</span>
                    </span>
                  </span>
                  <span style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3,
                    flex: '0 0 auto',
                  }}>
                    {isActive
                      ? <ICheck size={13} style={{ color: 'var(--gh-fg-1)' }} />
                      : <span style={{ width: 13, height: 13 }} />}
                    <span style={{ fontSize: 10, color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>{r.last}</span>
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{
                padding: '14px 12px', textAlign: 'center',
                fontSize: 11.5, color: 'var(--gh-fg-4)',
              }}>No repositories match “{q}”</div>
            )}
          </div>

          {/* Footer action */}
          <button className="gh-btn" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px',
            borderTop: '1px solid var(--gh-line-1)',
            fontSize: 12, color: 'var(--gh-fg-2)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <IFolder size={13} style={{ color: 'var(--gh-fg-3)' }} />
            <span>Open folder…</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>Clone…</span>
          </button>
        </div>
      )}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Tiny app shell — narrow window, single-pane stack.
const TinyApp = () => {
  const [open, setOpen] = React.useState({
    worktrees: true, branchesLocal: true, branchesRemote: false, stash: false,
  });
  const [repo, setRepo] = React.useState(SAMPLE_RECENTS[0]);
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));
  const sb = SAMPLE_BRANCHES;

  return (
    <MacWindow w={380} h={680} center={
      <RepoSwitcher repos={SAMPLE_RECENTS} active={repo} onPick={setRepo} />
    }>
      {/* Top toolbar — Commit is primary; Push/Fetch secondary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 10px',
        borderBottom: '1px solid var(--gh-line-1)',
      }}>
        <button className="gh-btn" title="Commit staged changes" style={{
          flex: 1, height: 28, borderRadius: 7,
          background: 'rgba(255,255,255,0.92)', color: '#15151a',
          fontSize: 12, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <IGitCommit size={12} /> Commit
          <span style={{
            fontFamily: 'var(--gh-font-mono)', fontSize: 10.5,
            color: 'rgba(21,21,26,0.55)', fontWeight: 500,
          }}>4</span>
        </button>
        <button className="gh-btn" title="Push" style={{
          height: 28, padding: '0 10px', borderRadius: 7,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--gh-line-2)',
          fontSize: 12, fontWeight: 500, color: 'var(--gh-fg-1)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}><IUpload size={12} /> Push</button>
        <button className="gh-btn" title="Merge main into current branch" style={{
          height: 28, padding: '0 10px', borderRadius: 7,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--gh-line-2)',
          fontSize: 12, fontWeight: 500, color: 'var(--gh-fg-1)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}><IGitMerge size={12} /> Sync</button>
        <button className="gh-btn" title="Fetch" style={{
          height: 28, width: 28, borderRadius: 7,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--gh-line-2)',
          color: 'var(--gh-fg-1)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}><IDownload size={12} /></button>
      </div>

      {/* Current branch summary strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid var(--gh-line-1)',
        fontSize: 11.5, fontFamily: 'var(--gh-font-mono)',
        color: 'var(--gh-fg-2)',
      }}>
        <IBranch size={11} stroke={1.6} style={{ color: 'var(--gh-fg-3)' }} />
        <span style={{
          color: 'var(--gh-fg-1)', flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{repo.branch}</span>
        <span style={{ color: 'var(--gh-fg-3)' }}>↑6 ↓0</span>
        {repo.dirty && <span className="gh-dot warn" />}
      </div>

      {/* Scrollable stack */}
      <div className="gh-scroll" style={{ flex: 1, overflow: 'auto' }}>

        {/* Worktrees */}
        <SectionHeader
          title="Worktrees"
          count={SAMPLE_WORKTREES.length}
          open={open.worktrees}
          onToggle={() => toggle('worktrees')}
          action={<button className="gh-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10.5, fontWeight: 500, letterSpacing: 0,
            textTransform: 'none',
            padding: '2px 7px', borderRadius: 4,
            border: '1px solid var(--gh-line-2)',
            color: 'var(--gh-fg-2)',
          }}><IPlus size={10} /> New</button>}
        />
        {open.worktrees && (
          <div>
            {SAMPLE_WORKTREES.map((w, i) => (
              <TinyWorktreeRow key={w.path} w={w} last={i === SAMPLE_WORKTREES.length - 1} />
            ))}
          </div>
        )}

        {/* Local branches */}
        <SectionHeader
          title="Local"
          count={sb.local.length}
          open={open.branchesLocal}
          onToggle={() => toggle('branchesLocal')}
        />
        {open.branchesLocal && (
          <div>
            {sb.local.map((b, i) => (
              <TinyBranchRow key={b.name} b={b} current={b.current} last={i === sb.local.length - 1} />
            ))}
          </div>
        )}

        {/* Remote branches */}
        <SectionHeader
          title="Remote"
          count={sb.origin.length}
          open={open.branchesRemote}
          onToggle={() => toggle('branchesRemote')}
        />
        {open.branchesRemote && (
          <div>
            {sb.origin.map((b, i) => (
              <TinyBranchRow key={b.name} b={b} last={i === sb.origin.length - 1} />
            ))}
          </div>
        )}

        {/* Stash */}
        <SectionHeader
          title="Stash"
          count={sb.stashes.length}
          open={open.stash}
          onToggle={() => toggle('stash')}
          action={<button className="gh-btn" style={{
            display: 'inline-flex', alignItems: 'center',
            color: 'var(--gh-fg-3)',
            width: 18, height: 18, borderRadius: 4,
          }}><IPlus size={10} /></button>}
        />
        {open.stash && (
          <div>
            {sb.stashes.map((s, i) => (
              <div key={s.id} style={{
                padding: '8px 12px',
                borderBottom: i === sb.stashes.length - 1 ? 'none' : '1px dashed rgba(255,255,255,0.04)',
                cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{
                  fontSize: 12, color: 'var(--gh-fg-1)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{s.msg}</div>
                <div style={{
                  marginTop: 2, fontSize: 10.5, color: 'var(--gh-fg-4)',
                  fontFamily: 'var(--gh-font-mono)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>stash@{`{${s.id}}`}</span>
                  <span>·</span>
                  <span>{s.age}</span>
                </div>
              </div>
            ))}
            {sb.stashes.length === 0 && (
              <div style={{
                padding: '10px 12px',
                fontSize: 11, color: 'var(--gh-fg-4)',
                fontFamily: 'var(--gh-font-mono)',
              }}>No stashes</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        height: 26, flex: '0 0 26px',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px',
        borderTop: '1px solid var(--gh-line-1)',
        background: 'var(--gh-bg-2)',
        fontSize: 10.5, color: 'var(--gh-fg-3)',
        fontFamily: 'var(--gh-font-mono)',
      }}>
        <span style={{
          flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{repo.path}</span>
        <span style={{ color: 'var(--gh-fg-4)' }}>·</span>
        <span>{repo.dirty
          ? <><span className="gh-dot warn" style={{ marginRight: 4 }} />4 changed</>
          : <><span className="gh-dot ok" style={{ marginRight: 4 }} />clean</>}</span>
      </div>
    </MacWindow>
  );
};

Object.assign(window, { TinyApp, OpenWithSplit, RepoMonogram, editors });
