/** Shared recents file format (Electron app + Raycast extension). */

export const RECENTS_MAX = 20;

export const RECENTS_APP_SUPPORT_DIR = 'gh-viewer';

export const RECENTS_FILE_NAME = 'recents.json';

export interface SharedRecentRepo {
  path: string;
  name: string;
  openedAt: number;
}

export interface RecentsFileV1 {
  version: 1;
  repos: SharedRecentRepo[];
}
