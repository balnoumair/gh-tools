import { app, nativeImage } from 'electron';
import path from 'node:path';

export function applyDockIcon(): void {
  if (process.platform !== 'darwin' || !app.dock) return;

  const iconPath = path.join(__dirname, '../../assets/icon.png');
  const image = nativeImage.createFromPath(iconPath);
  if (!image.isEmpty()) {
    app.dock.setIcon(image);
  }
}
