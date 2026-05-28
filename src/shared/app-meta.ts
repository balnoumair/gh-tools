/**
 * Product metadata for the two Electron apps built from this codebase.
 *
 * The two products share the same renderer bundle, preload, and main-process
 * services, but ship as separate .app bundles with their own name, icon, and
 * bundle id. The active product is chosen at build time via APP_TARGET
 * (see vite.main.config.ts + forge.config.ts).
 */

export type AppTarget = 'pr-pulse' | 'git-manager';

export interface AppMeta {
  target: AppTarget;
  /** Display name / productName used for the .app bundle and window/tray UI. */
  productName: string;
  /** macOS bundle identifier. */
  bundleId: string;
  /** Path (relative to repo root, no extension) to the packaged icon. */
  iconBase: string;
}

export const APP_META: Record<AppTarget, AppMeta> = {
  'pr-pulse': {
    target: 'pr-pulse',
    productName: 'PR Pulse',
    bundleId: 'com.bryanalnoumair.prpulse',
    iconBase: './assets/pr-pulse/icon',
  },
  'git-manager': {
    target: 'git-manager',
    productName: 'Git Manager',
    bundleId: 'com.bryanalnoumair.gitmanager',
    iconBase: './assets/git-manager/icon',
  },
};

export function resolveAppTarget(value: string | undefined): AppTarget {
  return value === 'pr-pulse' ? 'pr-pulse' : 'git-manager';
}
