import { app, nativeImage } from 'electron';
import path from 'node:path';

export function applyDockIcon(): void {
  if (process.platform !== 'darwin' || !app.dock) return;

  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, '../..');
  const iconPath = path.join(base, 'assets/git-manager/icon.png');
  const image = nativeImage.createFromPath(iconPath);
  if (!image.isEmpty()) {
    app.dock.setIcon(image);
  }
}
