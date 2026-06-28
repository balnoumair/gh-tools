import { create } from 'zustand';
import { DEFAULT_SETTINGS, mergeSettings, type AppSettings } from '@shared/settings';

interface SettingsStore {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  patch: (partial: Partial<AppSettings>) => void;
  flush: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: Partial<AppSettings> = {};

function accumulatePatch(partial: Partial<AppSettings>) {
  pendingPatch = mergeSettings(
    mergeSettings(DEFAULT_SETTINGS, pendingPatch),
    partial,
  );
}

async function persistPending(onSaved: (settings: AppSettings) => void): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const patch = pendingPatch;
  pendingPatch = {};
  if (Object.keys(patch).length === 0) return;
  const saved = await window.electronAPI.settingsSet(patch);
  onSaved(saved);
}

function schedulePersist(onSaved: (settings: AppSettings) => void) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void persistPending(onSaved);
  }, 350);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const settings = await window.electronAPI.settingsGet();
    set({ settings, loaded: true });
  },

  patch: (partial) => {
    set({ settings: mergeSettings(get().settings, partial) });
    accumulatePatch(partial);
    schedulePersist((settings) => set({ settings }));
  },

  flush: () => persistPending((settings) => set({ settings })),
}));
