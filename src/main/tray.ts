import { app, Menu, Tray, nativeImage, BrowserWindow, screen } from 'electron';
import path from 'node:path';

let tray: Tray | null = null;
let popoverWindow: BrowserWindow | null = null;

function createTrayIcon(): Electron.NativeImage {
  // The PR Pulse glyph (heartbeat waveform + notification dot) as a macOS
  // menu-bar template image — black on transparent, no background, so the OS
  // recolors it for the active menu bar. The matching @2x file is picked up
  // automatically for retina displays.
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, '../..');
  const iconPath = path.join(base, 'assets/pr-pulse/tray-template.png');
  const img = nativeImage.createFromPath(iconPath);
  img.setTemplateImage(true);
  return img;
}

export function createTray(
  getPopoverWindow: () => BrowserWindow | null,
  tooltip = 'PR Pulse',
  onOpenReviewer?: () => void,
): Tray {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip(tooltip);

  tray.on('right-click', () => {
    const menuItems: Electron.MenuItemConstructorOptions[] = [];
    if (onOpenReviewer) {
      menuItems.push({ label: 'Open Pulse', click: onOpenReviewer });
      menuItems.push({ type: 'separator' });
    }
    menuItems.push({ label: `Quit ${tooltip}`, click: () => app.quit() });
    tray!.popUpContextMenu(Menu.buildFromTemplate(menuItems));
  });

  tray.on('click', (_event, bounds) => {
    popoverWindow = getPopoverWindow();
    if (!popoverWindow) return;

    if (popoverWindow.isVisible()) {
      popoverWindow.hide();
      return;
    }

    const { x, y } = getPopoverPosition(bounds, popoverWindow);
    popoverWindow.setPosition(x, y, false);
    popoverWindow.show();
    popoverWindow.focus();
  });

  return tray;
}

function getPopoverPosition(
  trayBounds: Electron.Rectangle,
  window: BrowserWindow
): { x: number; y: number } {
  const windowBounds = window.getBounds();
  const display = screen.getDisplayNearestPoint({
    x: trayBounds.x,
    y: trayBounds.y,
  });

  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );
  const y = Math.round(trayBounds.y + trayBounds.height);

  // Clamp to screen
  const clampedX = Math.max(
    display.workArea.x,
    Math.min(x, display.workArea.x + display.workArea.width - windowBounds.width)
  );

  return { x: clampedX, y };
}

export function getTray(): Tray | null {
  return tray;
}
