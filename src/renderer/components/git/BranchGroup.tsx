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
        className="w-full flex items-center gap-1 px-3 py-[3px] text-[11px] text-mac-label-secondary font-semibold uppercase tracking-wide hover:bg-mac-control-active transition-colors"
      >
        <svg
          className={`w-[8px] h-[8px] text-mac-label-tertiary transition-transform duration-100 ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <path d="M2 1l4 3-4 3z" />
        </svg>
        <span className="ml-0.5">{label}</span>
        <span className="text-mac-label-quaternary ml-auto text-[10px] tabular-nums">{count}</span>
      </button>
      {open && <div className="pb-0.5">{children}</div>}
    </div>
  );
}
