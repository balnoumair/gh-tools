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
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1 text-[10.5px] text-mac-label-tertiary font-medium uppercase tracking-[0.10em] hover:text-mac-label-secondary transition-colors"
      >
        <svg
          className={`w-[7px] h-[7px] transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <path d="M2 1l4 3-4 3z" />
        </svg>
        <span>{label}</span>
        <span className="ml-auto text-mac-label-quaternary text-[10px] tabular-nums normal-case tracking-normal font-mono">{count}</span>
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}
