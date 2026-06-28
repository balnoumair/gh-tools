import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, mergeSettings } from '@shared/settings';

const settingsSet = vi.fn();
const settingsGet = vi.fn();

vi.stubGlobal('window', {
  electronAPI: { settingsSet, settingsGet },
});

describe('renderer settings-store', () => {
  beforeEach(async () => {
    vi.resetModules();
    settingsSet.mockReset();
    settingsGet.mockReset();
    settingsGet.mockResolvedValue(DEFAULT_SETTINGS);
    settingsSet.mockImplementation(async (patch) =>
      mergeSettings(DEFAULT_SETTINGS, patch),
    );
  });

  it('updates local state immediately and persists patches', async () => {
    const { useSettingsStore } = await import('../../src/renderer/stores/settings-store');
    await useSettingsStore.getState().load();

    useSettingsStore.getState().patch({
      review: { editors: { ...DEFAULT_SETTINGS.review.editors, zed: true } },
    });

    expect(useSettingsStore.getState().settings.review.editors.zed).toBe(true);

    await useSettingsStore.getState().flush();
    expect(settingsSet).toHaveBeenCalledTimes(1);
    const savedPatch = settingsSet.mock.calls[0][0];
    expect(savedPatch.review?.editors?.zed).toBe(true);
  });

  it('keeps in-memory state when reopening settings without reloading from disk', async () => {
    const { useSettingsStore } = await import('../../src/renderer/stores/settings-store');
    await useSettingsStore.getState().load();

    useSettingsStore.getState().patch({ review: { defaultEditor: 'cursor' } });
    settingsGet.mockResolvedValue(DEFAULT_SETTINGS);

    expect(useSettingsStore.getState().settings.review.defaultEditor).toBe('cursor');
  });
});
