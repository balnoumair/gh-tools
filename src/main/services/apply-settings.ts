import { POLL_INTERVAL_MS, type NotifierSettings, type PollInterval } from '@shared/settings';
import { setPollIntervalMs, setPollingEnabled, stopPolling } from './github-poller';

export function applyPollInterval(interval: PollInterval): void {
  if (interval === 'manual') {
    setPollingEnabled(false);
    stopPolling();
    return;
  }

  setPollingEnabled(true);
  setPollIntervalMs(POLL_INTERVAL_MS[interval]);
}

export function applyNotifierSettings(notifier: NotifierSettings): void {
  applyPollInterval(notifier.interval);
}
