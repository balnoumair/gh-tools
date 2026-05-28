import React, { useEffect } from 'react';
import TrayApp from './views/TrayApp';
import FullApp from './views/FullApp';

function getMode(): 'tray' | 'full' {
  const params = new URLSearchParams(window.location.search);
  return (params.get('mode') as 'tray' | 'full') || 'tray';
}

export default function App() {
  const mode = getMode();

  useEffect(() => {
    document.title = mode === 'tray' ? 'PR Pulse' : 'Git Manager';
  }, [mode]);

  return mode === 'tray' ? <TrayApp /> : <FullApp />;
}
