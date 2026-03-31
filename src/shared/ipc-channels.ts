export const IPC = {
  // GitHub
  GITHUB_GET_PRS: 'github:get-prs',
  GITHUB_FORCE_REFRESH: 'github:force-refresh',
  GITHUB_PRS_UPDATED: 'github:prs-updated',
  GITHUB_GET_AUTH_STATUS: 'github:get-auth-status',
  GITHUB_SET_TOKEN: 'github:set-token',
  GITHUB_SET_POLL_INTERVAL: 'github:set-poll-interval',

  // App
  APP_OPEN_FULL_WINDOW: 'app:open-full-window',
  APP_OPEN_EXTERNAL: 'app:open-external',
  APP_GET_SETTINGS: 'app:get-settings',
  APP_SAVE_SETTINGS: 'app:save-settings',
} as const;
