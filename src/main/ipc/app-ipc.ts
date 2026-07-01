import { ipcMain, shell } from 'electron';
import { setFullWindowSize } from '../windows';
import { IPC } from '@shared/ipc-channels';

/** Registers IPC handlers shared across PR Pulse and Git workspace surfaces. */
export function registerAppIpc(): void {
  ipcMain.handle(IPC.APP_OPEN_EXTERNAL, async (_event, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.handle(IPC.APP_SET_WINDOW_SIZE, async (_event, width: number, height: number) => {
    setFullWindowSize(width, height);
  });
}
