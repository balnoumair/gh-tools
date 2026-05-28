import React from 'react';
import type { EditorTarget } from '@shared/types';
// Same editor artwork the Raycast extension uses (dark-theme variants).
// Kept in sync with raycast-extension/assets/editors (see that dir's README).
import cursorIcon from '../../assets/editors/cursor_dark.svg';
import claudeIcon from '../../assets/editors/claude.svg';
import codexIcon from '../../assets/editors/codex_dark.svg';
import zedIcon from '../../assets/editors/zed_dark.svg';

function TerminalGlyph() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.5 4.5L6.5 7.5L3.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11h4.5" strokeLinecap="round" />
    </svg>
  );
}

const EDITORS: Array<{ target: EditorTarget; label: string; icon: React.ReactNode }> = [
  { target: 'cursor', label: 'Cursor', icon: <img src={cursorIcon} alt="" className="w-3.5 h-3.5" /> },
  { target: 'claude', label: 'Claude Code', icon: <img src={claudeIcon} alt="" className="w-3.5 h-3.5" /> },
  { target: 'codex', label: 'Codex', icon: <img src={codexIcon} alt="" className="w-3.5 h-3.5" /> },
  { target: 'zed', label: 'Zed', icon: <img src={zedIcon} alt="" className="w-3.5 h-3.5" /> },
  { target: 'terminal', label: 'Terminal', icon: <TerminalGlyph /> },
];

interface Props {
  path: string;
  onOpen: (target: EditorTarget, path: string) => void;
}

export default function EditorStrip({ path, onOpen }: Props) {
  return (
    <div className="flex items-center gap-1">
      {EDITORS.map((editor) => (
        <button
          key={editor.target}
          type="button"
          title={`Open in ${editor.label}`}
          aria-label={`Open in ${editor.label}`}
          onClick={() => onOpen(editor.target, path)}
          className="h-6 w-6 inline-flex items-center justify-center rounded bg-white/[0.035] border border-mac-separator text-mac-label-secondary hover:text-mac-label hover:bg-white/[0.07] transition-colors"
        >
          {editor.icon}
        </button>
      ))}
    </div>
  );
}
