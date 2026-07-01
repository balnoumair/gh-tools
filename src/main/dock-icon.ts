import { app, nativeImage } from 'electron';
import path from 'node:path';

function pulseIconBasePath(): string {
  return app.isPackaged ? process.resourcesPath : path.join(__dirname, '../..');
}

/** Loads the Pulse dock/app icon at the size macOS expects for the Dock. */
export function createDockIcon(): Electron.NativeImage {
  const base = pulseIconBasePath();
  // .icns carries proper macOS sizing; fall back to PNG in dev if needed.
  const icnsPath = path.join(base, 'assets/pr-pulse/icon.icns');
  const pngPath = path.join(base, 'assets/pr-pulse/icon.png');

  const image = nativeImage.createFromPath(icnsPath);
  if (!image.isEmpty()) return image;

  const png = nativeImage.createFromPath(pngPath);
  if (!png.isEmpty()) return png;

  return nativeImage.createEmpty();
}

export function applyDockIcon(): void {
  if (process.platform !== 'darwin' || !app.dock) return;

  const image = createDockIcon();
  if (!image.isEmpty()) {
    app.dock.setIcon(image);
  }
}

/** Hides the Dock icon — Pulse lives in the menu bar when no desktop window is open. */
export function hideDock(): void {
  if (process.platform !== 'darwin' || !app.dock) return;
  app.dock.hide();
}
