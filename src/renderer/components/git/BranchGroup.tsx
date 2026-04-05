import React, { useState } from 'react';

interface Props {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function BranchGroup({ label, count, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-mac-label-tertiary uppercase tracking-wider hover:bg-mac-fill/50 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
        <span>{label}</span>
        <span className="text-mac-label-tertiary/60 ml-auto">{count}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
