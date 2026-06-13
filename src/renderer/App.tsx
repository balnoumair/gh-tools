import React, { useEffect } from 'react';
import TrayApp from './views/TrayApp';
import FullApp from './views/FullApp';
import ReviewerApp from './views/ReviewerApp';

function getMode(): 'tray' | 'full' | 'reviewer' {
  const params = new URLSearchParams(window.location.search);
  return (params.get('mode') as 'tray' | 'full' | 'reviewer') || 'tray';
}

export default function App() {
  const mode = getMode();

  useEffect(() => {
    const titles = { tray: 'PR Pulse', full: 'Git Manager', reviewer: 'Reviewer' };
    document.title = titles[mode] ?? 'PR Pulse';
  }, [mode]);

  if (mode === 'reviewer') return <ReviewerApp />;
  return mode === 'tray' ? <TrayApp /> : <FullApp />;
}
