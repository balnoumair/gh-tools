import React, { useEffect } from 'react';
import TrayApp from './views/TrayApp';
import FullApp from './views/FullApp';

function getMode(): 'tray' | 'full' {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  return mode === 'full' ? 'full' : 'tray';
}

export default function App() {
  const mode = getMode();

  useEffect(() => {
    document.title = mode === 'full' ? 'Pulse' : 'PR Pulse';
  }, [mode]);

  return mode === 'full' ? <FullApp /> : <TrayApp />;
}
