import { Notification, shell } from 'electron';
import type { PullRequest } from '@shared/types';
import { getSettings } from './settings-store';
import { isNotifierRepoFlagged } from '@shared/settings';

// Keep references to prevent GC (known Electron macOS issue)
const notificationRefs = new Map<number, Notification>();

const TITLE_BY_MENTION: Record<PullRequest['mentionType'], string> = {
  review_requested: 'Review requested',
  mentioned: 'You were mentioned',
  assigned: 'Assigned to you',
  authored: 'Pull request opened',
};

export function showPRNotification(pr: PullRequest): void {
  const notifier = getSettings().notifier;
  const repoName = pr.repoFullName.split('/')[1] ?? pr.repoFullName;

  if (
    isNotifierRepoFlagged(notifier.hiddenRepos, pr.repoFullName)
    || isNotifierRepoFlagged(notifier.mutedRepos, pr.repoFullName)
  ) {
    return;
  }

  const allowedByType: Record<PullRequest['mentionType'], boolean> = {
    review_requested: notifier.notifyReview,
    assigned: notifier.notifyAssigned,
    mentioned: notifier.notifyMentions,
    authored: false,
  };

  if (!allowedByType[pr.mentionType]) {
    return;
  }

  const repoNameDisplay = repoName;
  const notification = new Notification({
    title: TITLE_BY_MENTION[pr.mentionType],
    subtitle: `${repoNameDisplay} · #${pr.number}`,
    body: `${pr.author.login} · ${pr.title}`,
    silent: !notifier.notifySound,
  });

  notificationRefs.set(pr.id, notification);

  notification.on('click', () => {
    shell.openExternal(pr.url);
    notificationRefs.delete(pr.id);
  });

  notification.on('close', () => {
    notificationRefs.delete(pr.id);
  });

  notification.show();

  // Clean up after 5 minutes to prevent memory leak
  setTimeout(() => {
    notificationRefs.delete(pr.id);
  }, 5 * 60 * 1000);
}
