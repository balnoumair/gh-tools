import { Tray, nativeImage, BrowserWindow, screen } from 'electron';
import path from 'node:path';

let tray: Tray | null = null;
let popoverWindow: BrowserWindow | null = null;

function createTrayIcon(): Electron.NativeImage {
  // Create a simple 22x22 template image for macOS menu bar
  // Using a minimal git-branch-like icon rendered as raw pixels
  const size = 22;
  const canvas = Buffer.alloc(size * size * 4, 0);

  // Draw a simple dot pattern that represents a PR icon
  const setPixel = (x: number, y: number, alpha: number) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const offset = (y * size + x) * 4;
      canvas[offset] = 0;     // R
      canvas[offset + 1] = 0; // G
      canvas[offset + 2] = 0; // B
      canvas[offset + 3] = alpha; // A
    }
  };

  // Draw a circle (PR icon - simplified)
  const drawCircle = (cx: number, cy: number, r: number) => {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) {
          setPixel(cx + x, cy + y, 220);
        }
      }
    }
  };

  // Draw vertical line
  for (let y = 5; y <= 16; y++) {
    setPixel(8, y, 200);
    setPixel(9, y, 200);
  }

  // Draw branch line
  for (let y = 5; y <= 10; y++) {
    setPixel(13, y, 200);
    setPixel(14, y, 200);
  }
  // Diagonal connector
  setPixel(12, 11, 200);
  setPixel(11, 12, 200);
  setPixel(10, 13, 200);

  // Circles at endpoints
  drawCircle(9, 4, 2);
  drawCircle(9, 17, 2);
  drawCircle(14, 4, 2);

  const img = nativeImage.createFromBuffer(canvas, { width: size, height: size });
  img.setTemplateImage(true);
  return img;
}

export function createTray(getPopoverWindow: () => BrowserWindow | null): Tray {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('gh-viewer');

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
