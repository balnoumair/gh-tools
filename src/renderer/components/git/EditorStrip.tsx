import React from 'react';
import type { EditorTarget } from '@shared/types';

const EDITORS: Array<{ target: EditorTarget; label: string; glyph: string }> = [
  { target: 'cursor', label: 'Cursor', glyph: 'Cu' },
  { target: 'claude', label: 'Claude Code', glyph: 'Cl' },
  { target: 'codex', label: 'Codex', glyph: 'Cx' },
  { target: 'zed', label: 'Zed', glyph: 'Z' },
  { target: 'terminal', label: 'Terminal', glyph: '>_' },
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
          className="h-6 min-w-6 px-1.5 rounded bg-white/[0.035] border border-mac-separator text-[9.5px] text-mac-label-secondary font-mono hover:text-mac-label hover:bg-white/[0.07] transition-colors"
        >
          {editor.glyph}
        </button>
      ))}
    </div>
  );
}
