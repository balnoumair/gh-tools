import React from 'react';

export default function FullApp() {
  return (
    <div className="h-full flex flex-col">
      <div className="h-10 border-b border-mac-separator flex items-center px-4 drag-region">
        <span className="text-[13px] text-mac-label-secondary font-medium">
          Git Manager
        </span>
        <span className="ml-2 text-[11px] text-mac-label-tertiary">Phase 2</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-1">
          <div className="text-mac-label-secondary text-[13px]">
            Git Manager — coming in Phase 2
          </div>
          <div className="text-mac-label-tertiary text-[11px]">
            Branch ops, merge conflicts, diff viewer
          </div>
        </div>
      </div>
    </div>
  );
}
