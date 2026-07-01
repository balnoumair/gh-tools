export const SETTINGS_FILE_NAME = '.gh-tools';

export type PollInterval = '30s' | '1m' | '5m' | '15m' | '30m' | 'manual';

export type GitCommandId =
  | 'push'
  | 'pull'
  | 'fetch'
  | 'commit'
  | 'merge'
  | 'wadd'
  | 'wremove'
  | 'bdelete';

export interface GitCommandDef {
  id: GitCommandId;
  label: string;
  def: string;
}

export interface NotifierSettings {
  interval: PollInterval;
  pauseOnBattery: boolean;
  notifyReview: boolean;
  notifyAssigned: boolean;
  notifyMentions: boolean;
  notifyCI: boolean;
  notifySound: boolean;
  notifyOnlyInBackground: boolean;
  /** GitHub `owner/repo` → skip desktop notifications (PRs may still show in popover) */
  mutedRepos: Record<string, boolean>;
  /** GitHub `owner/repo` → hide from menubar popover entirely */
  hiddenRepos: Record<string, boolean>;
}

export interface ReviewSettings {
  editors: Record<string, boolean>;
  defaultEditor: string;
  /** Repo name → show PR section in sidebar */
  showPR: Record<string, boolean>;
  /** Repo path → root expanded in sidebar (missing = open) */
  openRoots: Record<string, boolean>;
  /** Repo path → PR subsection expanded (missing = open) */
  prSectionsOpen: Record<string, boolean>;
  commands: Partial<Record<GitCommandId, string>>;
}

export interface AppSettings {
  version: 1;
  notifier: NotifierSettings;
  review: ReviewSettings;
}

export const GIT_COMMAND_DEFS: GitCommandDef[] = [
  { id: 'push', label: 'Push', def: 'git push origin HEAD' },
  { id: 'pull', label: 'Pull', def: 'git pull --ff-only' },
  { id: 'fetch', label: 'Fetch', def: 'git fetch --all --prune' },
  { id: 'commit', label: 'Commit', def: 'git commit -m "$MESSAGE"' },
  { id: 'merge', label: 'Merge main', def: 'git merge origin/main' },
  { id: 'wadd', label: 'New worktree', def: 'git worktree add {path} {branch}' },
  { id: 'wremove', label: 'Remove worktree', def: 'git worktree remove {path}' },
  { id: 'bdelete', label: 'Delete branch', def: 'git branch -D {branch}' },
];

export const DEFAULT_GIT_COMMANDS = Object.fromEntries(
  GIT_COMMAND_DEFS.map((c) => [c.id, c.def]),
) as Record<GitCommandId, string>;

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  notifier: {
    interval: '5m',
    pauseOnBattery: true,
    notifyReview: true,
    notifyAssigned: true,
    notifyMentions: true,
    notifyCI: false,
    notifySound: false,
    notifyOnlyInBackground: true,
    mutedRepos: {},
    hiddenRepos: {},
  },
  review: {
    editors: {
      cursor: true,
      claude: true,
      codex: true,
      zed: false,
      terminal: true,
      finder: true,
    },
    defaultEditor: 'claude',
    showPR: {},
    openRoots: {},
    prSectionsOpen: {},
    commands: {},
  },
};

export const POLL_INTERVAL_MS: Record<Exclude<PollInterval, 'manual'>, number> = {
  '30s': 30_000,
  '1m': 60_000,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '30m': 30 * 60_000,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merge settings patches while preserving defaults for missing keys. */
export function mergeSettings(base: AppSettings, patch: Partial<AppSettings>): AppSettings {
  const out: AppSettings = structuredClone(base);

  if (patch.notifier) {
    out.notifier = {
      ...out.notifier,
      ...patch.notifier,
      mutedRepos: { ...out.notifier.mutedRepos, ...patch.notifier.mutedRepos },
      hiddenRepos: { ...out.notifier.hiddenRepos, ...patch.notifier.hiddenRepos },
    };
  }

  if (patch.review) {
    out.review = {
      ...out.review,
      ...patch.review,
      editors: { ...out.review.editors, ...patch.review.editors },
      showPR: { ...out.review.showPR, ...patch.review.showPR },
      openRoots: { ...out.review.openRoots, ...patch.review.openRoots },
      prSectionsOpen: { ...out.review.prSectionsOpen, ...patch.review.prSectionsOpen },
      commands: { ...out.review.commands, ...patch.review.commands },
    };
  }

  if (patch.version !== undefined) {
    out.version = patch.version;
  }

  return out;
}

/** Parse persisted JSON into AppSettings, falling back to defaults. */
export function parseSettings(raw: unknown): AppSettings {
  if (!isPlainObject(raw)) return structuredClone(DEFAULT_SETTINGS);
  return mergeSettings(DEFAULT_SETTINGS, raw as Partial<AppSettings>);
}

export function getGitCommand(settings: AppSettings, id: GitCommandId): string {
  return settings.review.commands[id] ?? DEFAULT_GIT_COMMANDS[id];
}

export function repoShortName(repoFullName: string): string {
  return repoFullName.split('/')[1] ?? repoFullName;
}

/** Notifier flags use `owner/repo`; legacy entries may use the short repo name only. */
export function isNotifierRepoFlagged(
  flags: Record<string, boolean>,
  repoFullName: string,
): boolean {
  if (flags[repoFullName]) return true;
  return !!flags[repoShortName(repoFullName)];
}

export function uniqueNotifierRepos(prs: Array<{ repoFullName: string }>): Array<{ fullName: string; name: string }> {
  const seen = new Set<string>();
  const repos: Array<{ fullName: string; name: string }> = [];
  for (const pr of prs) {
    if (seen.has(pr.repoFullName)) continue;
    seen.add(pr.repoFullName);
    repos.push({ fullName: pr.repoFullName, name: repoShortName(pr.repoFullName) });
  }
  return repos.sort((a, b) => a.name.localeCompare(b.name));
}
