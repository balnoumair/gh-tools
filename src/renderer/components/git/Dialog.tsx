import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Dialog({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-mac-bg-popover border border-mac-separator-heavy rounded-xl shadow-dialog w-[400px] max-h-[80vh] overflow-y-auto animate-menu-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-mac-separator">
          <h3 className="text-[13px] font-semibold text-mac-label">{title}</h3>
          <button
            onClick={onClose}
            className="w-[14px] h-[14px] flex items-center justify-center rounded-full bg-mac-label-quaternary hover:bg-mac-label-tertiary transition-colors"
          >
            <svg className="w-[7px] h-[7px] text-mac-bg-window" viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l5 5M6 1l-5 5" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
