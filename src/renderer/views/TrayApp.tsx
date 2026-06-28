import React, { useEffect } from 'react';
import { usePRStore } from '../stores/pr-store';
import { useSettingsStore } from '../stores/settings-store';
import TrayHeader from '../components/tray/TrayHeader';
import PRList from '../components/tray/PRList';
import AuthPrompt from '../components/tray/AuthPrompt';
import { CC_POPOVER_SHELL } from '../theme/cc-theme';

export default function TrayApp() {
  const { checkAuth, fetchPRs, authStatus, setPRs } = usePRStore();

  useEffect(() => {
    checkAuth().then(() => fetchPRs());
    void useSettingsStore.getState().load();

    const unsubscribe = window.electronAPI.onPRsUpdated((prs) => {
      setPRs(prs);
    });

    return unsubscribe;
  }, []);

  const isAuthed = authStatus?.authenticated ?? false;

  return (
    <div style={CC_POPOVER_SHELL}>
      <TrayHeader />

      <div className="gh-scroll flex-1 overflow-y-auto min-h-0">
        {!isAuthed ? <AuthPrompt /> : <PRList />}
      </div>
    </div>
  );
}
