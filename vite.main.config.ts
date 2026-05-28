import { defineConfig } from 'vite';
import path from 'node:path';

// Which product this main-process bundle is built for. Selected at build time
// via the APP_TARGET env var (see the package.json `*:pulse` / `*:manager`
// scripts and forge.config.ts). Defaults to the Git Manager app.
const appTarget = process.env.APP_TARGET === 'pr-pulse' ? 'pr-pulse' : 'git-manager';

export default defineConfig({
  define: {
    __APP_TARGET__: JSON.stringify(appTarget),
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
