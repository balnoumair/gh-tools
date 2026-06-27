export type AppTarget = 'pr-pulse';

export interface AppMeta {
  target: AppTarget;
  productName: string;
  bundleId: string;
  iconBase: string;
}

export const APP_META: Record<AppTarget, AppMeta> = {
  'pr-pulse': {
    target: 'pr-pulse',
    productName: 'Pulse',
    bundleId: 'com.bryanalnoumair.pulse',
    iconBase: './assets/pr-pulse/icon',
  },
};

export function resolveAppTarget(_value: string | undefined): AppTarget {
  return 'pr-pulse';
}
