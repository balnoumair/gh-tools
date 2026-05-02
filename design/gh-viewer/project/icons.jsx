// icons.jsx — line-icon set used across the GH Viewer redesigns.
// All icons are 1.5px stroked, inheriting currentColor. Keep small (16/14).

const Icon = ({ d, size = 16, stroke = 1.5, fill = 'none', children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round"
       style={{ flex: '0 0 auto', display: 'block', ...style }}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IBranch = (p) => (
  <Icon {...p}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="2.2" />
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="6" cy="3" r="0" fill="currentColor" stroke="none" />
    <path d="M18 8.2c0 4.5-3 5.8-6 5.8" />
  </Icon>
);

const IGitMerge = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="9" r="2.2" />
    <path d="M6 8.2v7.6" />
    <path d="M6 9c0 4 4 6 9.8 6" />
  </Icon>
);

const IGitCommit = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </Icon>
);

const IGitPullRequest = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="18" r="2.2" />
    <line x1="6" y1="8.2" x2="6" y2="15.8" />
    <path d="M14 5h2a2 2 0 0 1 2 2v8.8" />
    <path d="M11 2 14 5l-3 3" />
  </Icon>
);

const IExternal = (p) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </Icon>
);

const IRefresh = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </Icon>
);

const ISearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <line x1="20" y1="20" x2="16" y2="16" />
  </Icon>
);

const IFolder = (p) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </Icon>
);

const IPlus = (p) => (
  <Icon {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

const ICheck = (p) => (
  <Icon {...p}>
    <polyline points="5 12 10 17 19 7" />
  </Icon>
);

const IChevR = (p) => (<Icon {...p}><polyline points="9 6 15 12 9 18" /></Icon>);
const IChevD = (p) => (<Icon {...p}><polyline points="6 9 12 15 18 9" /></Icon>);

const IDots = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="18" cy="12" r="1.2" fill="currentColor" />
  </Icon>
);

const IClose = (p) => (<Icon {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></Icon>);

const ITrash = (p) => (
  <Icon {...p}>
    <polyline points="4 7 20 7" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </Icon>
);

const ITerminal = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <polyline points="7 9 10 12 7 15" />
    <line x1="13" y1="15" x2="17" y2="15" />
  </Icon>
);

const ICheckCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="8 12 11 15 16 9" />
  </Icon>
);

const IDownload = (p) => (
  <Icon {...p}>
    <path d="M12 4v12" />
    <polyline points="7 11 12 16 17 11" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </Icon>
);

const IUpload = (p) => (
  <Icon {...p}>
    <path d="M12 20V8" />
    <polyline points="7 13 12 8 17 13" />
    <line x1="4" y1="4" x2="20" y2="4" />
  </Icon>
);

const IClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </Icon>
);

const ICircle = (p) => (<Icon {...p}><circle cx="12" cy="12" r="9" /></Icon>);

const IFlow = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="12" cy="18" r="2" />
    <path d="M6 8v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8" />
    <path d="M12 14v2" />
  </Icon>
);

// Editor brand glyphs — abstracted so we don't reproduce real logos.
// Each is a simple monogram in a rounded square.
const EditorGlyph = ({ name, size = 18 }) => {
  const map = {
    cursor: { letter: 'C', tone: '#d8d8dc' },
    claude: { letter: 'CC', tone: '#cfd8c8' },
    codex:  { letter: '>_', tone: '#c8d4dc' },
    zed:    { letter: 'Z', tone: '#dcd2c8' },
    terminal: { letter: '$', tone: '#c8c8cc' },
    finder: { letter: 'F', tone: '#c8c8cc' },
  };
  const { letter, tone } = map[name] || map.terminal;
  return (
    <span style={{
      width: size, height: size, borderRadius: 5,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
      color: tone,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--gh-font-mono)',
      fontSize: letter.length > 1 ? Math.round(size * 0.46) : Math.round(size * 0.58),
      fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em',
      flex: '0 0 auto',
    }}>{letter}</span>
  );
};

Object.assign(window, {
  Icon, IBranch, IGitMerge, IGitCommit, IGitPullRequest, IExternal,
  IRefresh, ISearch, IFolder, IPlus, ICheck, IChevR, IChevD, IDots, IClose,
  ITrash, ITerminal, ICheckCircle, IDownload, IUpload, IClock, ICircle, IFlow,
  EditorGlyph,
});
