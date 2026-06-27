import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { APP_META, resolveAppTarget } from './src/shared/app-meta';

// Which product to package. Selected via APP_TARGET (see the package.json
// `*:pulse` / `*:manager` scripts). Must match vite.main.config.ts's define.
const meta = APP_META[resolveAppTarget(process.env.APP_TARGET)];

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: meta.productName,
    appBundleId: meta.bundleId,
    icon: meta.iconBase,
    extraResource: ['assets'],
    // Pulse is primarily a menubar agent — dock icon shown programmatically
    // when the workspace window is open.
    extendInfo: { LSUIElement: 1 },
    // The Raycast extension opens repos via gh-viewer:// deep links.
    protocols: [{ name: 'Pulse', schemes: ['gh-viewer'] }],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
