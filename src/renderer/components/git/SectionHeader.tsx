import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'ghv:tiny-app:sections';

function loadSectionState(id: string, defaultOpen: boolean): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed[id] === 'boolean' ? parsed[id] : defaultOpen;
  } catch {
    return defaultOpen;
  }
}

function saveSectionState(id: string, open: boolean) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, [id]: open }));
  } catch {
    // Section state is a convenience only.
  }
}

interface Props {
  id: string;
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: (open: boolean) => React.ReactNode;
  action?: React.ReactNode;
}

export default function SectionHeader({
  id,
  title,
  count,
  defaultOpen = false,
  children,
  action,
}: Props) {
  const [open, setOpen] = useState(() => loadSectionState(id, defaultOpen));

  useEffect(() => {
    saveSectionState(id, open);
  }, [id, open]);

  return (
    <section className="border-b border-mac-separator">
      <div className="flex items-center pr-2">
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex-1 flex items-center gap-1.5 px-3 py-2 text-[10.5px] text-mac-label-tertiary font-medium uppercase tracking-[0.10em] hover:text-mac-label-secondary transition-colors"
        >
          <svg
            className={`w-[7px] h-[7px] transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
            viewBox="0 0 8 8"
            fill="currentColor"
          >
            <path d="M2 1l4 3-4 3z" />
          </svg>
          <span>{title}</span>
          <span className="text-mac-label-quaternary text-[10px] tabular-nums normal-case tracking-normal font-mono">
            {count}
          </span>
        </button>
        {action}
      </div>
      {children(open)}
    </section>
  );
}
