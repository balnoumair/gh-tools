import { useSettingsStore } from '../stores/settings-store';

/** Debounced partial writes to ~/.gh-tools via the shared settings store. */
export function useSettingsPatch() {
  return useSettingsStore((state) => state.patch);
}
