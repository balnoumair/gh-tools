import { useCallback, useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS, mergeSettings, type AppSettings } from '@shared/settings';

/** Debounced partial writes to ~/.gh-tools. */
export function useSettingsPatch() {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<Partial<AppSettings>>({});

  const flushSave = useCallback(() => {
    const patch = pendingPatch.current;
    pendingPatch.current = {};
    if (Object.keys(patch).length > 0) {
      void window.electronAPI.settingsSet(patch);
    }
  }, []);

  const patchSettings = useCallback((patch: Partial<AppSettings>) => {
    pendingPatch.current = mergeSettings(
      mergeSettings(DEFAULT_SETTINGS, pendingPatch.current),
      patch,
    );
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, 350);
  }, [flushSave]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    flushSave();
  }, [flushSave]);

  return patchSettings;
}
