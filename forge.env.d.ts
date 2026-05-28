/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

/** Build-time product selector injected by vite.main.config.ts. */
declare const __APP_TARGET__: 'pr-pulse' | 'git-manager';
