import React, { useState } from 'react';
import type { DiffFile, DiffLine as DiffLineData } from '@shared/types';

const REV = {
  addFg: '#7fd49a', addBg: 'rgba(110,196,138,0.10)', addGutter: 'rgba(110,196,138,0.16)',
  delFg: '#e88f8f', delBg: 'rgba(224,122,122,0.10)', delGutter: 'rgba(224,122,122,0.16)',
  hunkFg: '#8aaed8',
};

const STATUS_GLYPH: Record<DiffFile['status'], { ch: string; tone: string }> = {
  modified: { ch: 'M', tone: '#d9c98a' },
  added:    { ch: 'A', tone: '#7fd49a' },
  deleted:  { ch: 'D', tone: '#e88f8f' },
  renamed:  { ch: 'R', tone: '#8fa6e6' },
};

function DiffLine({ ln }: { ln: DiffLineData }) {
  const isAdd = ln.type === 'add';
  const isDel = ln.type === 'del';
  const bg = isAdd ? REV.addBg : isDel ? REV.delBg : 'transparent';
  const gutterBg = isAdd ? REV.addGutter : isDel ? REV.delGutter : 'transparent';
  const sign = isAdd ? '+' : isDel ? '-' : ' ';
  const codeFg = isAdd ? REV.addFg : isDel ? REV.delFg : 'rgba(255,255,255,0.7)';
  const gut: React.CSSProperties = {
    textAlign: 'right', padding: '0 8px', color: 'rgba(255,255,255,0.25)',
    fontSize: 11, userSelect: 'none', background: gutterBg,
    borderRight: '1px solid rgba(255,255,255,0.05)',
  };
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '46px 46px 1fr',
      background: bg, lineHeight: '19px', minHeight: 19,
    }}>
      <span style={gut}>{ln.old ?? ''}</span>
      <span style={gut}>{ln.nw ?? ''}</span>
      <span style={{ display: 'flex', paddingLeft: 6, paddingRight: 12, whiteSpace: 'pre', color: codeFg, fontSize: 12 }}>
        <span style={{
          width: 12, flexShrink: 0,
          color: isAdd ? REV.addFg : isDel ? REV.delFg : 'rgba(255,255,255,0.25)',
          opacity: sign === ' ' ? 0 : 0.9,
        }}>{sign}</span>
        <span style={{ flex: 1 }}>{ln.text || ' '}</span>
      </span>
    </div>
  );
}

export function FileDiff({ file }: { file: DiffFile }) {
  const [open, setOpen] = useState(true);
  const g = STATUS_GLYPH[file.status] ?? STATUS_GLYPH.modified;
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'sticky', top: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', cursor: 'pointer',
          background: 'rgba(26,26,29,0.94)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <svg
          width="12" height="12" viewBox="0 0 8 8" fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform .15s', flexShrink: 0 }}
        >
          <path d="M1 2.5L4 5.5L7 2.5" />
        </svg>
        <span style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10, fontWeight: 700,
          color: g.tone, border: `1px solid ${g.tone}`, opacity: 0.9,
        }}>{g.ch}</span>
        <span style={{
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12.5,
          color: 'rgba(255,255,255,0.9)', flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          direction: 'rtl', textAlign: 'left',
        }}>{file.path}</span>
        <span style={{
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 11, flexShrink: 0,
          display: 'flex', gap: 8,
        }}>
          <span style={{ color: REV.addFg }}>+{file.additions}</span>
          <span style={{ color: REV.delFg }}>−{file.deletions}</span>
        </span>
      </div>
      {open && (
        <div style={{ fontFamily: 'var(--gh-font-mono, monospace)' }}>
          {file.hunks.map((h, i) => (
            <div key={i}>
              <div style={{
                padding: '3px 14px 3px 92px', fontSize: 11, color: REV.hunkFg,
                background: 'rgba(138,174,216,0.06)',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{h.header}</div>
              {h.lines.map((ln, j) => <DiffLine key={j} ln={ln} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DiffSectionBand({
  icon, label, count, tone,
}: {
  icon: React.ReactNode; label: string; count?: number; tone?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
      background: 'rgba(0,0,0,0.22)',
      borderTop: '1px solid rgba(255,255,255,0.09)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 10.5,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span style={{ color: tone ?? 'rgba(255,255,255,0.45)', display: 'inline-flex' }}>{icon}</span>
      <span style={{ color: tone ?? 'rgba(255,255,255,0.45)' }}>{label}</span>
      {count != null && <span style={{ color: 'rgba(255,255,255,0.25)' }}>{count}</span>}
    </div>
  );
}
