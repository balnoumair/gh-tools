import React, { useEffect } from 'react';
import { repoFromRendererSearchParams } from '@shared/deep-link';
import { useGitStore } from '../stores/git-store';
import RaycastLauncher from '../components/git/RaycastLauncher';
import TitleBar from '../components/git/TitleBar';
import Toolbar from '../components/git/Toolbar';
import RepositorySection from '../components/git/RepositorySection';
import WorktreeSection from '../components/git/WorktreeSection';
import BranchSection from '../components/git/BranchSection';
import StashSection from '../components/git/StashSection';
import Footer from '../components/git/Footer';
import MergeDialog from '../components/git/MergeDialog';
import PushDialog from '../components/git/PushDialog';
import UpdateDialog from '../components/git/UpdateDialog';
import StashCreateDialog from '../components/git/StashCreateDialog';
import CreateBranchDialog from '../components/git/CreateBranchDialog';

export default function FullApp() {
  const {
    activeRepo,
    refreshStatus,
    isLoadingStatus,
    transientToast,
    hydrateRecents,
    openRepo,
  } = useGitStore();

  useEffect(() => {
    void hydrateRecents();
  }, [hydrateRecents]);

  useEffect(() => {
    const initialRepo = repoFromRendererSearchParams(window.location.search);
    if (initialRepo) {
      void openRepo(initialRepo);
    }

    const unsubscribe = window.electronAPI.onOpenRepoRequested((repo) => {
      void openRepo(repo);
    });

    return unsubscribe;
  }, [openRepo]);

  useEffect(() => {
    if (!activeRepo) return;

    const handleFocus = () => refreshStatus();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeRepo?.path, refreshStatus]);

  if (!activeRepo) return <RaycastLauncher />;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-app-canvas">
      <TitleBar />
      <Toolbar />
      <div className="flex-1 min-h-0 overflow-y-auto bg-mac-bg-content">
        <RepositorySection />
        <WorktreeSection />
        <BranchSection kind="local" />
        <BranchSection kind="remote" />
        <StashSection />
      </div>

      <Footer />

      {isLoadingStatus && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-mac-bg-popover rounded-lg shadow-menu text-[12.5px] text-mac-label">
            <span className="gh-mark text-mac-accent w-3.5 h-3.5 animate-spark" aria-hidden />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {transientToast && (
        <div className="absolute left-3 right-3 bottom-9 z-50 pointer-events-none">
          <div
            className={`rounded-md border px-3 py-2 shadow-menu text-[12px] ${
              transientToast.kind === 'error'
                ? 'bg-mac-bg-popover border-mac-red text-mac-label'
                : transientToast.kind === 'success'
                  ? 'bg-mac-bg-popover border-mac-green text-mac-label'
                  : 'bg-mac-bg-popover border-mac-separator-heavy text-mac-label'
            }`}
          >
            {transientToast.message}
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
