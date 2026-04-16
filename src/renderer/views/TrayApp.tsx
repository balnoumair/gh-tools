import React, { useEffect } from 'react';
import { usePRStore } from '../stores/pr-store';
import TrayHeader from '../components/tray/TrayHeader';
import PRList from '../components/tray/PRList';
import TrayFooter from '../components/tray/TrayFooter';
import AuthPrompt from '../components/tray/AuthPrompt';

export default function TrayApp() {
  const { checkAuth, fetchPRs, authStatus, setPRs } = usePRStore();

  useEffect(() => {
    checkAuth().then(() => fetchPRs());

    const unsubscribe = window.electronAPI.onPRsUpdated((prs) => {
      setPRs(prs);
    });

    return unsubscribe;
  }, []);

  const isAuthed = authStatus?.authenticated ?? false;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-app-canvas">
      <TrayHeader />

      <div className="flex-1 overflow-y-auto min-h-0">
        {!isAuthed ? <AuthPrompt /> : <PRList />}
      </div>

      <TrayFooter />
    </div>
  );
}
