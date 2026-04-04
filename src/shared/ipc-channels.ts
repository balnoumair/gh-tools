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

  // Git management
  GIT_SELECT_REPO: 'git:select-repo',
  GIT_GET_REPO_STATUS: 'git:get-repo-status',
  GIT_CHECKOUT_BRANCH: 'git:checkout-branch',
  GIT_CREATE_BRANCH: 'git:create-branch',
  GIT_DELETE_BRANCH: 'git:delete-branch',
  GIT_MERGE: 'git:merge',
  GIT_PUSH: 'git:push',
  GIT_FETCH: 'git:fetch',
  GIT_PULL: 'git:pull',
  GIT_STASH_CREATE: 'git:stash-create',
  GIT_STASH_APPLY: 'git:stash-apply',
  GIT_STASH_DROP: 'git:stash-drop',
} as const;
