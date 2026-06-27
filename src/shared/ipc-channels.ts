export const IPC = {
  // GitHub
  GITHUB_GET_PRS: 'github:get-prs',
  GITHUB_FORCE_REFRESH: 'github:force-refresh',
  GITHUB_PRS_UPDATED: 'github:prs-updated',
  GITHUB_GET_AUTH_STATUS: 'github:get-auth-status',
  GITHUB_SET_POLL_INTERVAL: 'github:set-poll-interval',

  // App
  APP_OPEN_REPO: 'app:open-repo',
  APP_OPEN_EXTERNAL: 'app:open-external',
  APP_SET_WINDOW_SIZE: 'app:set-window-size',

  // Git management
  GIT_LOAD_RECENTS: 'git:load-recents',
  GIT_TOUCH_RECENT: 'git:touch-recent',
  GIT_REMOVE_RECENT: 'git:remove-recent',
  GIT_SELECT_REPO: 'git:select-repo',
  GIT_GET_REPO_STATUS: 'git:get-repo-status',
  GIT_LIST_WORKTREES: 'git:list-worktrees',
  GIT_CREATE_WORKTREE: 'git:create-worktree',
  GIT_REMOVE_WORKTREE: 'git:remove-worktree',
  GIT_COMMIT_WORKTREE: 'git:commit-worktree',
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

  // Editor launchers
  EDITOR_OPEN: 'editor:open',

  // Diff
  GITHUB_GET_PR_DIFF: 'github:get-pr-diff',
  GIT_GET_WORKTREE_DIFF: 'git:get-worktree-diff',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

} as const;
