import { Notification, shell } from 'electron';
import type { PullRequest } from '@shared/types';

// Keep references to prevent GC (known Electron macOS issue)
const notificationRefs = new Map<number, Notification>();

const TITLE_BY_MENTION: Record<PullRequest['mentionType'], string> = {
  review_requested: 'Review requested',
  mentioned: 'You were mentioned',
  assigned: 'Assigned to you',
  authored: 'Pull request opened',
};

export function showPRNotification(pr: PullRequest): void {
  const repoName = pr.repoFullName.split('/')[1] ?? pr.repoFullName;
  const notification = new Notification({
    title: TITLE_BY_MENTION[pr.mentionType],
    subtitle: `${repoName} · #${pr.number}`,
    body: `${pr.author.login} · ${pr.title}`,
    silent: false,
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
