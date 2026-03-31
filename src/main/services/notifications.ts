import { Notification, shell } from 'electron';
import type { PullRequest } from '@shared/types';

// Keep references to prevent GC (known Electron macOS issue)
const notificationRefs = new Map<number, Notification>();

export function showPRNotification(pr: PullRequest): void {
  const notification = new Notification({
    title: `PR #${pr.number} — ${pr.repoFullName}`,
    body: `${pr.author.login}: ${pr.title}`,
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
