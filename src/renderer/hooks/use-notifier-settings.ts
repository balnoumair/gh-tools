import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type NotifierSettings } from '@shared/settings';

/** Loads notifier settings from ~/.gh-tools; refreshes when the window regains focus. */
export function useNotifierSettings(): NotifierSettings {
  const [notifier, setNotifier] = useState<NotifierSettings>(DEFAULT_SETTINGS.notifier);

  const reload = useCallback(() => {
    void window.electronAPI.settingsGet().then((s) => setNotifier(s.notifier));
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);

  return notifier;
}
