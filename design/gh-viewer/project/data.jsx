// data.jsx — sample data shared by all variations.

const SAMPLE_PRS = [
  {
    id: 1, num: 482, title: "Worktree manager: support orphan branches",
    repo: "noumair/gh-viewer", author: "marina", avatar: "M",
    state: "review", ci: "ok", age: "2h", reviewers: 3,
    comments: 4, additions: 142, deletions: 38,
  },
  {
    id: 2, num: 478, title: "Add codex as recognized editor target",
    repo: "noumair/gh-viewer", author: "you", avatar: "Y",
    state: "yours", ci: "running", age: "5h",
    comments: 2, additions: 24, deletions: 6,
  },
  {
    id: 3, num: 1209, title: "Refactor stash drawer into branch context",
    repo: "noumair/mtg-builder", author: "kenji", avatar: "K",
    state: "review", ci: "fail", age: "yesterday", reviewers: 2,
    comments: 11, additions: 312, deletions: 287,
  },
  {
    id: 4, num: 91, title: "Use SF Mono for path display",
    repo: "noumair/dotfiles", author: "sasha", avatar: "S",
    state: "mention", ci: "ok", age: "3d",
    comments: 1, additions: 8, deletions: 3,
  },
  {
    id: 5, num: 64, title: "Bump rust-toolchain to 1.84",
    repo: "noumair/gh-viewer", author: "you", avatar: "Y",
    state: "yours", ci: "ok", age: "4d",
    comments: 0, additions: 1, deletions: 1,
  },
  {
    id: 6, num: 233, title: "Document the menubar IPC handshake",
    repo: "noumair/gh-viewer", author: "ola", avatar: "O",
    state: "assigned", ci: "ok", age: "1w",
    comments: 6, additions: 78, deletions: 0,
  },
];

const SAMPLE_RECENTS = [
  { name: "gh-viewer", path: "~/Projects/gh-viewer", branch: "feat/worktree-pane", dirty: true, branches: 12, last: "5m" },
  { name: "mtg-builder", path: "~/Projects/mtg-builder", branch: "main", dirty: false, branches: 4, last: "yesterday" },
  { name: "dotfiles", path: "~/.config/dotfiles", branch: "main", dirty: false, branches: 1, last: "3d" },
  { name: "noumair-site", path: "~/Projects/noumair-site", branch: "redesign", dirty: true, branches: 7, last: "1w" },
  { name: "raycast-tools", path: "~/code/raycast-tools", branch: "main", dirty: false, branches: 2, last: "2w" },
];

const SAMPLE_BRANCHES = {
  current: "feat/worktree-pane",
  local: [
    { name: "main", sha: "75a4378", ahead: 0, behind: 4, worktrees: 1, pr: null },
    { name: "feat/worktree-pane", sha: "9c14e02", ahead: 6, behind: 0, worktrees: 2, pr: { num: 482, state: "open", ci: "ok" }, current: true },
    { name: "feat/codex-target", sha: "1f0a8b3", ahead: 2, behind: 1, worktrees: 1, pr: { num: 478, state: "open", ci: "running" } },
    { name: "fix/path-mono", sha: "ae2210c", ahead: 1, behind: 0, worktrees: 0, pr: null },
    { name: "exp/sf-symbols", sha: "44b9d18", ahead: 12, behind: 8, worktrees: 0, pr: null },
  ],
  origin: [
    { name: "origin/main", sha: "8910fcc", behind: 0 },
    { name: "origin/release/0.4", sha: "ee71204", behind: 18 },
    { name: "origin/marina/orphan-branches", sha: "55c0a17", behind: 0 },
    { name: "origin/dependabot/cargo/clap", sha: "fe44a09", behind: 32 },
  ],
  stashes: [
    { id: 0, msg: "WIP on feat/worktree-pane: drawer focus state", age: "1h" },
    { id: 1, msg: "menu width tweak", age: "yesterday" },
  ],
};

const SAMPLE_COMMITS = [
  { sha: "9c14e02", title: "drawer: persist collapsed state across launches", author: "you", age: "2h" },
  { sha: "12ab8e1", title: "worktree: surface dirty/clean ahead-behind in row", author: "you", age: "5h" },
  { sha: "0b711aa", title: "worktree: open in editor (cursor, claude, codex, zed)", author: "you", age: "8h" },
  { sha: "44d8201", title: "worktrees: add list, create, remove plumbing", author: "marina", age: "yesterday" },
  { sha: "ee0a44b", title: "branch: lift inline metadata into row", author: "marina", age: "2d" },
  { sha: "abc1240", title: "ipc: fix dropped notification on resume", author: "you", age: "3d" },
];

const SAMPLE_WORKTREES = [
  { path: "~/Projects/gh-viewer",          branch: "feat/worktree-pane", dirty: true,  primary: true,  ahead: 6, behind: 0 },
  { path: "~/Projects/gh-viewer-482",      branch: "feat/worktree-pane", dirty: false, primary: false, ahead: 6, behind: 0 },
  { path: "~/Projects/gh-viewer-codex",    branch: "feat/codex-target",  dirty: true,  primary: false, ahead: 2, behind: 1 },
];

Object.assign(window, { SAMPLE_PRS, SAMPLE_RECENTS, SAMPLE_BRANCHES, SAMPLE_COMMITS, SAMPLE_WORKTREES });
