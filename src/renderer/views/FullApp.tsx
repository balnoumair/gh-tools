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

  // Refresh status on window focus
  useEffect(() => {
    if (!activeRepo) return;

    const handleFocus = () => refreshStatus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeRepo?.path, refreshStatus]);

  if (!activeRepo) return <RepoPickerEmpty />;

  return (
    <div className="h-full flex flex-col bg-ghv-bg bg-grid">
      <GitTitleBar />
      <GitToolbar />

      <div className="flex-1 flex min-h-0">
        <BranchPanel />
        <div className="flex-1 flex flex-col min-w-0">
          <StashPanel />
          <OutputPanel />
        </div>
      </div>

      <StatusBar />

      {/* Loading overlay */}
      {isLoadingStatus && (
        <div className="absolute inset-0 bg-ghv-bg/50 flex items-center justify-center pointer-events-none z-40">
          <div className="flex items-center gap-2 text-xs text-ghv-text-dim">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2a6 6 0 1 1-6 6" />
            </svg>
            Loading repository...
          </div>
        </div>
      )}

      {/* Dialogs */}
      <MergeDialog />
      <PushDialog />
      <UpdateDialog />
      <StashCreateDialog />
      <CreateBranchDialog />
    </div>
  );
}
