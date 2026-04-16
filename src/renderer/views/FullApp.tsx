import React, { useEffect } from 'react';
import { useGitStore } from '../stores/git-store';
import RepoPickerEmpty from '../components/git/RepoPickerEmpty';
import GitTitleBar from '../components/git/GitTitleBar';
import GitToolbar from '../components/git/GitToolbar';
import BranchPanel from '../components/git/BranchPanel';
import StashPanel from '../components/git/StashPanel';
import OutputPanel from '../components/git/OutputPanel';
import StatusBar from '../components/git/StatusBar';
import MergeDialog from '../components/git/MergeDialog';
import PushDialog from '../components/git/PushDialog';
import UpdateDialog from '../components/git/UpdateDialog';
import StashCreateDialog from '../components/git/StashCreateDialog';
import CreateBranchDialog from '../components/git/CreateBranchDialog';

export default function FullApp() {
  const { activeRepo, refreshStatus, isLoadingStatus } = useGitStore();

  useEffect(() => {
    if (!activeRepo) return;

    const handleFocus = () => refreshStatus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeRepo?.path, refreshStatus]);

  if (!activeRepo) return <RepoPickerEmpty />;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-app-canvas">
      <GitTitleBar />
      <GitToolbar />

      <div className="flex-1 flex min-h-0">
        <BranchPanel />
        <div className="flex-1 flex flex-col min-w-0 bg-mac-bg-content">
          <StashPanel />
          <OutputPanel />
        </div>
      </div>

      <StatusBar />

      {isLoadingStatus && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-mac-bg-popover rounded-xl shadow-menu text-[12.5px] text-mac-label">
            <span className="claude-mark text-mac-accent w-3.5 h-3.5 animate-spark" aria-hidden />
            <span>Loading…</span>
          </div>
        </div>
      )}

      <MergeDialog />
      <PushDialog />
      <UpdateDialog />
      <StashCreateDialog />
      <CreateBranchDialog />
    </div>
  );
}
