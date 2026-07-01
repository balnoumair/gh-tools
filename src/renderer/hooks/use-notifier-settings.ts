import { useCallback, useEffect } from 'react';
import { type NotifierSettings } from '@shared/settings';
import { useSettingsStore } from '../stores/settings-store';

/** Notifier settings from the shared store; reloads from disk when the window regains focus. */
export function useNotifierSettings(): NotifierSettings {
  const notifier = useSettingsStore((state) => state.settings.notifier);
  const load = useSettingsStore((state) => state.load);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  useEffect(() => {
    reload();
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);

  return notifier;
}
