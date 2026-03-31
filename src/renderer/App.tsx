import React from 'react';
import TrayApp from './views/TrayApp';
import FullApp from './views/FullApp';

function getMode(): 'tray' | 'full' {
  const params = new URLSearchParams(window.location.search);
  return (params.get('mode') as 'tray' | 'full') || 'tray';
}

export default function App() {
  const mode = getMode();
  return mode === 'tray' ? <TrayApp /> : <FullApp />;
}
