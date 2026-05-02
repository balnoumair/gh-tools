// picker.jsx — three variations of the repo picker (post-launch empty + recents).

const MacWindow = ({ children, title = "Git Manager", subtitle, w = 920, h = 580 }) => (
  <div className="gh" style={{
    width: w, height: h,
    background: 'var(--gh-bg-1)',
    borderRadius: 'var(--gh-radius-window)',
    border: '1px solid var(--gh-line-2)',
    boxShadow: 'var(--gh-shadow-window)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'var(--gh-font-ui)',
  }}>
    <div style={{
      height: 36, flex: '0 0 36px',
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      padding: '0 12px',
      borderBottom: '1px solid var(--gh-line-1)',
      background: 'linear-gradient(180deg, #1c1c1f 0%, #161618 100%)',
      WebkitAppRegion: 'drag',
    }}>
      <div className="gh-traffic">
        <span className="gh-tl close" /><span className="gh-tl min" /><span className="gh-tl max" />
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 12, color: 'var(--gh-fg-2)', fontWeight: 500,
      }}>
        <IBranch size={12} stroke={1.6} />
        <span>{title}</span>
        {subtitle && <>
          <span style={{ color: 'var(--gh-fg-4)' }}>›</span>
          <span style={{ color: 'var(--gh-fg-1)', fontWeight: 600 }}>{subtitle}</span>
        </>}
      </div>
      <div />
    </div>
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</div>
  </div>
);

const RepoIcon = ({ letter = 'h', size = 28 }) => (
  <span style={{
    width: size, height: size, borderRadius: 6,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--gh-line-1)',
    color: 'var(--gh-fg-2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--gh-font-mono)', fontSize: 13,
    flex: '0 0 auto',
  }}>{letter}</span>
);

// ---------------------------------------------------------------------------
// Picker A — "Refined" — keeps the centered hero, but recents become rich
// rows (current branch + dirty marker + branches count + last opened).

const PickerA = () => (
  <MacWindow w={920} h={580}>
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 64px',
    }}>
      <IBranch size={20} stroke={1.4} style={{ color: 'var(--gh-fg-3)' }} />
      <h1 style={{
        margin: '14px 0 6px', fontSize: 22, fontWeight: 600,
        color: 'var(--gh-fg-1)', letterSpacing: '-0.01em',
      }}>What's up next, there?</h1>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--gh-fg-3)' }}>
        Open a repository to start managing branches and worktrees.
      </p>
      <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
        <button className="gh-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 32, padding: '0 14px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.92)',
          color: '#15151a', fontSize: 13, fontWeight: 500,
        }}>
          <IFolder size={14} />
          Open repository…
        </button>
        <button className="gh-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 32, padding: '0 14px',
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--gh-line-2)',
          color: 'var(--gh-fg-1)', fontSize: 13, fontWeight: 500,
        }}>
          <IPlus size={13} />
          Clone…
        </button>
      </div>

      <div style={{
        marginTop: 36, width: '100%', maxWidth: 520,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--gh-fg-3)',
          marginBottom: 8,
        }}>
          Recents
          <span style={{ flex: 1, height: 1, background: 'var(--gh-line-1)' }} />
        </div>
        <div style={{
          background: 'var(--gh-bg-2)',
          border: '1px solid var(--gh-line-1)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {SAMPLE_RECENTS.slice(0, 4).map((r, i) => (
            <div key={r.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              borderBottom: i === 3 ? 'none' : '1px solid var(--gh-line-1)',
              cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RepoIcon letter="h" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, fontWeight: 500, color: 'var(--gh-fg-1)',
                }}>
                  <span>{r.name}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: 'var(--gh-fg-3)', fontWeight: 400,
                    fontFamily: 'var(--gh-font-mono)',
                  }}>
                    <IBranch size={10} stroke={1.6} />
                    {r.branch}
                    {r.dirty && <span className="gh-dot warn" style={{ width: 6, height: 6 }} />}
                  </span>
                </div>
                <div style={{
                  marginTop: 1, fontSize: 11,
                  color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{r.path}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)' }}>{r.last}</span>
              <IChevR size={12} style={{ color: 'var(--gh-fg-4)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </MacWindow>
);

// ---------------------------------------------------------------------------
// Picker B — "Sidebar workspace" — Linear/Tower-leaning. Sidebar of recents
// with a search/command bar, main pane shows the focused repo's quick stats
// when one is hovered. No empty hero — recents become the primary surface.

const PickerB = () => {
  const [hover, setHover] = React.useState(0);
  const r = SAMPLE_RECENTS[hover];
  return (
    <MacWindow w={920} h={580}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* sidebar */}
        <div style={{
          width: 280, flex: '0 0 280px',
          background: 'var(--gh-bg-2)',
          borderRight: '1px solid var(--gh-line-1)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 12px 8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--gh-line-1)',
              borderRadius: 7, padding: '0 8px', gap: 8, height: 28,
            }}>
              <ISearch size={12} style={{ color: 'var(--gh-fg-3)' }} />
              <input placeholder="Search or paste path…" style={{
                background: 'transparent', border: 0, outline: 'none', flex: 1,
                color: 'var(--gh-fg-1)', fontSize: 12, fontFamily: 'inherit',
              }} />
              <span className="gh-kbd">⌘O</span>
            </div>
          </div>
          <div style={{
            padding: '4px 12px', fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--gh-fg-3)',
          }}>Recent</div>
          <div className="gh-scroll" style={{ flex: 1, overflow: 'auto', padding: '0 6px 6px' }}>
            {SAMPLE_RECENTS.map((rep, i) => (
              <div key={rep.name}
                onMouseEnter={() => setHover(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: hover === i ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}>
                <RepoIcon letter="h" size={22} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5, color: 'var(--gh-fg-1)', fontWeight: 500,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{rep.name}</div>
                  <div style={{
                    fontSize: 11, color: 'var(--gh-fg-3)',
                    fontFamily: 'var(--gh-font-mono)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{rep.branch}</div>
                </div>
                {rep.dirty && <span className="gh-dot warn" style={{ width: 6, height: 6 }} />}
              </div>
            ))}
          </div>
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--gh-line-1)',
            display: 'flex', gap: 6,
          }}>
            <button className="gh-btn" style={{
              flex: 1, height: 28, borderRadius: 6,
              border: '1px solid var(--gh-line-2)',
              color: 'var(--gh-fg-1)', fontSize: 12, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><IFolder size={12} /> Open…</button>
            <button className="gh-btn" style={{
              flex: 1, height: 28, borderRadius: 6,
              border: '1px solid var(--gh-line-2)',
              color: 'var(--gh-fg-1)', fontSize: 12, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><IPlus size={12} /> Clone</button>
          </div>
        </div>
        {/* preview pane */}
        <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <RepoIcon letter="h" size={44} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--gh-fg-1)' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)' }}>{r.path}</div>
            </div>
            <button className="gh-btn" style={{
              marginLeft: 'auto',
              height: 30, padding: '0 14px', borderRadius: 7,
              background: 'rgba(255,255,255,0.92)', color: '#15151a',
              fontSize: 12.5, fontWeight: 600,
            }}>Open</button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          }}>
            {[
              { l: 'Branch', v: r.branch, mono: true },
              { l: 'Branches', v: r.branches, mono: true },
              { l: 'Last opened', v: r.last, mono: true },
            ].map(s => (
              <div key={s.l} style={{
                background: 'var(--gh-bg-2)',
                border: '1px solid var(--gh-line-1)',
                borderRadius: 8,
                padding: '10px 12px',
              }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--gh-fg-3)',
                }}>{s.l}</div>
                <div style={{
                  marginTop: 4, fontSize: 13, color: 'var(--gh-fg-1)',
                  fontFamily: s.mono ? 'var(--gh-font-mono)' : 'inherit',
                }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--gh-fg-3)',
              marginBottom: 8,
            }}>Status</div>
            <div style={{
              background: 'var(--gh-bg-2)',
              border: '1px solid var(--gh-line-1)',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 14,
              fontSize: 12, color: 'var(--gh-fg-2)',
              fontFamily: 'var(--gh-font-mono)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className={`gh-dot ${r.dirty ? 'warn' : 'ok'}`} />
                {r.dirty ? 'uncommitted changes' : 'clean'}
              </span>
              <span style={{ color: 'var(--gh-fg-4)' }}>·</span>
              <span>↑ 6  ↓ 0</span>
              <span style={{ color: 'var(--gh-fg-4)' }}>·</span>
              <span>2 worktrees</span>
            </div>
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

// ---------------------------------------------------------------------------
// Picker C — "Spotlight launcher" — pure command-bar feel. Centered narrow
// surface, type to filter, recents list inline. No window padding waste.

const PickerC = () => (
  <MacWindow w={920} h={580}>
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start', paddingTop: 96,
    }}>
      <div style={{
        width: 540,
        background: 'var(--gh-bg-2)',
        border: '1px solid var(--gh-line-2)',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid var(--gh-line-1)',
        }}>
          <IFolder size={16} style={{ color: 'var(--gh-fg-3)' }} />
          <input placeholder="Open a repository…" autoFocus style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            color: 'var(--gh-fg-1)', fontSize: 15, fontFamily: 'inherit',
          }} />
          <span className="gh-kbd">⌘O</span>
        </div>
        <div style={{
          padding: '6px 8px',
          maxHeight: 320, overflow: 'auto',
        }}>
          <div style={{
            padding: '6px 10px 4px', fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--gh-fg-3)',
          }}>Recent</div>
          {SAMPLE_RECENTS.map((r, i) => (
            <div key={r.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 10px',
              borderRadius: 7,
              cursor: 'pointer',
              background: i === 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}>
              <RepoIcon letter="h" size={24} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 8,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gh-fg-1)' }}>{r.name}</span>
                  <span style={{
                    fontSize: 11, color: 'var(--gh-fg-3)',
                    fontFamily: 'var(--gh-font-mono)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    flex: 1, minWidth: 0,
                  }}>{r.path}</span>
                </div>
                <div style={{
                  marginTop: 2, fontSize: 11, color: 'var(--gh-fg-3)',
                  display: 'flex', gap: 10,
                  fontFamily: 'var(--gh-font-mono)',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <IBranch size={10} stroke={1.6} /> {r.branch}
                  </span>
                  <span>{r.branches} branches</span>
                  {r.dirty && <span style={{ color: 'var(--gh-warn)' }}>● dirty</span>}
                </div>
              </div>
              {i === 0 && <span className="gh-kbd">↵</span>}
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '8px 14px',
          borderTop: '1px solid var(--gh-line-1)',
          fontSize: 11, color: 'var(--gh-fg-3)',
          fontFamily: 'var(--gh-font-mono)',
        }}>
          <span>↵ open</span>
          <span>⌘N clone</span>
          <span>⌘⇧O browse…</span>
          <span style={{ marginLeft: 'auto', color: 'var(--gh-fg-4)' }}>{SAMPLE_RECENTS.length} recents</span>
        </div>
      </div>
    </div>
  </MacWindow>
);

// ---------------------------------------------------------------------------
// Picker D — "Raycast extension" — clicking a repo doesn't open the Git
// Manager, it surfaces an action panel inside Raycast: Commit, Push, Pull,
// Open in Cursor / Claude / Codex / Zed / Terminal / Finder. This is the
// happy path for users who live in Raycast and never need the full app.

const RaycastIcon = ({ children, bg = 'linear-gradient(180deg,#3a3a3f,#26262a)', size = 22 }) => (
  <span style={{
    width: size, height: size, borderRadius: 5,
    background: bg,
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--gh-fg-1)',
    flex: '0 0 auto',
  }}>{children}</span>
);

const RayKbd = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 18, height: 18, padding: '0 5px',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--gh-fg-2)',
    fontFamily: 'var(--gh-font-mono)', fontSize: 10.5,
    letterSpacing: 0,
  }}>{children}</span>
);

const RayActionRow = ({ icon, label, kbd, danger }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 10px',
    borderRadius: 7,
    cursor: 'pointer',
    color: danger ? 'var(--gh-danger)' : 'var(--gh-fg-1)',
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <span style={{
      width: 20, height: 20, borderRadius: 4,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: danger ? 'var(--gh-danger)' : 'var(--gh-fg-2)',
      flex: '0 0 auto',
    }}>{icon}</span>
    <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
    {kbd && <span style={{ display: 'inline-flex', gap: 3 }}>
      {kbd.map((k, i) => <RayKbd key={i}>{k}</RayKbd>)}
    </span>}
  </div>
);

const RaySectionLabel = ({ children }) => (
  <div style={{
    padding: '8px 10px 4px',
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
    color: 'var(--gh-fg-3)', textTransform: 'uppercase',
  }}>{children}</div>
);

const PickerD = () => {
  // After the user picked gh-viewer in PickerC, Raycast pushes a repo-scoped
  // view: list of branches & worktrees for THIS repo, with the action panel
  // (⌘K) showing all the per-row git + open-in actions.
  const repo = SAMPLE_RECENTS[0]; // gh-viewer
  const items = [
    // Worktrees first — they're the actionable units
    { kind: 'worktree', name: 'feat/worktree-pane', sub: '~/Projects/gh-viewer', dirty: true,  primary: true,  ahead: 6, behind: 0, pr: 482 },
    { kind: 'worktree', name: 'feat/worktree-pane', sub: '~/Projects/gh-viewer-482', dirty: false, primary: false, ahead: 6, behind: 0, pr: 482 },
    { kind: 'worktree', name: 'feat/codex-target',  sub: '~/Projects/gh-viewer-codex', dirty: true,  primary: false, ahead: 2, behind: 1, pr: 478 },
    // Branches without a worktree
    { kind: 'branch', name: 'main',             sub: '75a4378 · ↓4',  dirty: false },
    { kind: 'branch', name: 'fix/path-mono',    sub: 'ae2210c · ↑1',  dirty: false },
    { kind: 'branch', name: 'exp/sf-symbols',   sub: '44b9d18 · ↑12 ↓8', dirty: false },
  ];
  const selectedIndex = 0;
  const sel = items[selectedIndex];

  return (
    <MacWindow w={920} h={580}>
      <div style={{
        flex: 1, position: 'relative',
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(80,80,88,0.18), transparent 60%),' +
          'radial-gradient(ellipse at 80% 90%, rgba(50,50,56,0.18), transparent 55%),' +
          'var(--gh-bg-1)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 56,
      }}>
        <div style={{
          width: 720,
          background: 'rgba(28,28,30,0.94)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          color: 'var(--gh-fg-1)',
          fontFamily: 'var(--gh-font-ui)',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Search w/ breadcrumb showing we're inside the repo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <RaycastIcon size={20} bg="linear-gradient(135deg,#ff5b3a,#c93214)">
              <IBranch size={12} stroke={2} />
            </RaycastIcon>
            <span style={{ fontSize: 13, color: 'var(--gh-fg-3)' }}>Git Manager</span>
            <span style={{ color: 'var(--gh-fg-4)' }}>›</span>
            <span style={{ fontSize: 13, color: 'var(--gh-fg-1)', fontWeight: 500 }}>{repo.name}</span>
            <span style={{ color: 'var(--gh-fg-4)' }}>›</span>
            <input
              placeholder="Filter branches…"
              autoFocus
              style={{
                flex: 1, background: 'transparent', border: 0, outline: 'none',
                color: 'var(--gh-fg-1)', fontSize: 14, fontFamily: 'inherit',
              }} />
            {repo.dirty && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, color: 'var(--gh-warn)',
                fontFamily: 'var(--gh-font-mono)',
              }}>
                <span className="gh-dot warn" style={{ width: 6, height: 6 }} />
                4 uncommitted
              </span>
            )}
          </div>

          {/* List of branches & worktrees */}
          <div style={{ padding: '6px 8px', minHeight: 360 }}>
            <RaySectionLabel>Worktrees</RaySectionLabel>
            {items.filter(i => i.kind === 'worktree').map((it, i) => (
              <div key={`w${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px',
                borderRadius: 7,
                cursor: 'pointer',
                background: items.indexOf(it) === selectedIndex ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gh-fg-2)',
                  flex: '0 0 auto',
                }}><IFolder size={11} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, color: 'var(--gh-fg-1)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontFamily: 'var(--gh-font-mono)' }}>{it.name}</span>
                    {it.primary && <span style={{
                      fontSize: 10, padding: '0 5px', height: 14, borderRadius: 3,
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--gh-fg-3)', display: 'inline-flex', alignItems: 'center',
                      letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600,
                    }}>main</span>}
                    {it.pr && <span style={{
                      fontSize: 11, color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)',
                    }}>#{it.pr}</span>}
                  </div>
                  <div style={{
                    marginTop: 1, fontSize: 11, color: 'var(--gh-fg-3)',
                    fontFamily: 'var(--gh-font-mono)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{it.sub} · ↑{it.ahead} ↓{it.behind}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {it.dirty
                    ? <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11, color: 'var(--gh-warn)',
                        fontFamily: 'var(--gh-font-mono)',
                      }}>
                        <span className="gh-dot warn" style={{ width: 6, height: 6 }} />
                        modified
                      </span>
                    : <span style={{
                        fontSize: 11, color: 'var(--gh-fg-3)', fontFamily: 'var(--gh-font-mono)',
                      }}>clean</span>}
                </span>
              </div>
            ))}

            <RaySectionLabel>Branches</RaySectionLabel>
            {items.filter(i => i.kind === 'branch').map((it, i) => (
              <div key={`b${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px',
                borderRadius: 7,
                cursor: 'pointer',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 5,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gh-fg-3)',
                  flex: '0 0 auto',
                }}><IBranch size={12} stroke={1.6} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--gh-fg-1)', fontFamily: 'var(--gh-font-mono)' }}>{it.name}</div>
                  <div style={{
                    marginTop: 1, fontSize: 11, color: 'var(--gh-fg-3)',
                    fontFamily: 'var(--gh-font-mono)',
                  }}>{it.sub}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--gh-fg-4)', fontFamily: 'var(--gh-font-mono)' }}>no worktree</span>
              </div>
            ))}
          </div>

          {/* Footer with primary action + ⌘K */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.2)',
            fontSize: 11, color: 'var(--gh-fg-3)',
          }}>
            <RaycastIcon size={16} bg="linear-gradient(135deg,#ff5b3a,#c93214)">
              <IBranch size={9} stroke={2} />
            </RaycastIcon>
            <span style={{ fontWeight: 500, color: 'var(--gh-fg-2)' }}>Open in Cursor</span>
            <RayKbd>↵</RayKbd>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>Actions</span>
              <RayKbd>⌘</RayKbd><RayKbd>K</RayKbd>
            </span>
          </div>

          {/* Floating action sheet (⌘K menu) anchored bottom-right */}
          <div style={{
            position: 'absolute',
            right: 8, bottom: 36,
            width: 280,
            background: 'rgba(40,40,44,0.96)',
            backdropFilter: 'blur(40px) saturate(150%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 10,
            boxShadow: '0 16px 40px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.4)',
            padding: '6px 6px',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '8px 10px 6px',
              fontSize: 11, color: 'var(--gh-fg-3)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: 'var(--gh-fg-2)', fontFamily: 'var(--gh-font-mono)' }}>{sel.name}</span>
              <span style={{ color: 'var(--gh-fg-4)' }}>·</span>
              <span style={{ fontFamily: 'var(--gh-font-mono)' }}>{sel.sub.split(' · ')[0].replace(/^.*\//, '')}</span>
            </div>

            <RaySectionLabel>Open in</RaySectionLabel>
            <RayActionRow icon={<RaycastIcon size={16} bg="linear-gradient(180deg,#1a1a1d,#000)"><span style={{ fontSize: 9, fontWeight: 700 }}>C</span></RaycastIcon>} label="Cursor" kbd={['↵']} />
            <RayActionRow icon={<RaycastIcon size={16} bg="linear-gradient(135deg,#cc785c,#8a4a36)"><span style={{ fontSize: 9, fontWeight: 700 }}>✻</span></RaycastIcon>} label="Claude Code" kbd={['⌘', '↵']} />
            <RayActionRow icon={<RaycastIcon size={16} bg="linear-gradient(180deg,#2a2a2e,#15151a)"><span style={{ fontSize: 9, fontWeight: 700 }}>cx</span></RaycastIcon>} label="Codex" />
            <RayActionRow icon={<RaycastIcon size={16} bg="linear-gradient(135deg,#0aa,#077)"><span style={{ fontSize: 9, fontWeight: 700 }}>Z</span></RaycastIcon>} label="Zed" />
            <RayActionRow icon={<ITerminal size={14} />} label="Terminal" kbd={['⌘', 'T']} />
            <RayActionRow icon={<IFolder size={14} />} label="Reveal in Finder" />

            <RaySectionLabel>Git</RaySectionLabel>
            <RayActionRow icon={<IGitCommit size={14} />} label="Commit changes…" kbd={['⌘', 'C']} />
            <RayActionRow icon={<IUpload size={14} />} label="Push" kbd={['⌘', 'U']} />
            <RayActionRow icon={<IDownload size={14} />} label="Pull" />
            <RayActionRow icon={<IGitMerge size={14} />} label="Merge main → branch" />
            <RayActionRow icon={<ITrash size={14} />} label="Remove worktree" danger kbd={['⌘', '⌫']} />
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

Object.assign(window, { PickerA, PickerB, PickerC, PickerD, MacWindow });
