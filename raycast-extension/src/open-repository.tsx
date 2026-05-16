// Side-effect import — must be FIRST so PATH is augmented before any spawn.
import "./lib/path-fix";
import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
} from "@raycast/api";
import { execa } from "execa";
import { useCallback, useEffect, useState } from "react";
import { OpenFolderForm } from "./components/open-folder-form";
import { loadRecents, removeRecent } from "./lib/recents";
import { RepoWorkspaceView } from "./repo-workspace";
import type { Repo } from "./lib/types";

interface RepoMeta {
  branch: string | null;
  dirty: boolean;
  branchCount: number;
  /** Set when the repo can't be read (deleted folder, broken git, …). */
  error?: string;
}

export default function OpenRepositoryCommand() {
  const [recents, setRecents] = useState<Repo[]>([]);
  const [meta, setMeta] = useState<Record<string, RepoMeta>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await loadRecents();
    setRecents(list);
    setLoading(false);

    // Fetch per-repo metadata concurrently. UI will fill in as results land.
    const next: Record<string, RepoMeta> = {};
    await Promise.all(
      list.map(async (r) => {
        next[r.path] = await readRepoMeta(r.path);
      }),
    );
    setMeta(next);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRemove = useCallback(
    async (repoPath: string) => {
      await removeRecent(repoPath);
      void refresh();
    },
    [refresh],
  );

  const handleAddedFromForm = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search recent repos…"
      navigationTitle="Open Repository"
    >
      <List.EmptyView
        icon={Icon.Folder}
        title="No recent repositories"
        description="Add a repository folder to get started."
        actions={
          <ActionPanel>
            <Action.Push
              title="Add Repository…"
              icon={Icon.Plus}
              target={<OpenFolderForm onAdded={handleAddedFromForm} />}
            />
          </ActionPanel>
        }
      />
      <List.Section title="Add">
        <List.Item
          title="Add Repository…"
          icon={Icon.Plus}
          keywords={["add", "new", "folder", "open"]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Add Repository…"
                icon={Icon.Plus}
                target={<OpenFolderForm onAdded={handleAddedFromForm} />}
              />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Recent" subtitle={String(recents.length)}>
        {recents.map((repo) => (
          <RepoRow
            key={repo.path}
            repo={repo}
            meta={meta[repo.path]}
            onRemove={handleRemove}
          />
        ))}
      </List.Section>
    </List>
  );
}

function RepoRow({
  repo,
  meta,
  onRemove,
}: {
  repo: Repo;
  meta: RepoMeta | undefined;
  onRemove: (path: string) => void;
}) {
  const accessories: List.Item.Accessory[] = [];
  if (meta?.branch) {
    accessories.push({ tag: { value: meta.branch, color: Color.Blue } });
  }
  if (typeof meta?.branchCount === "number") {
    accessories.push({ text: `${meta.branchCount} branches` });
  }
  if (meta?.dirty) {
    accessories.push({ tag: { value: "dirty", color: Color.Yellow } });
  }
  if (meta?.error) {
    accessories.push({ tag: { value: "missing", color: Color.Red } });
  }

  return (
    <List.Item
      title={repo.name}
      subtitle={repo.path}
      keywords={[repo.path]}
      accessories={accessories}
      actions={
        <ActionPanel>
          {/* First action = default ⏎ — open the workspace (worktrees + branches). */}
          <Action.Push
            title="Open Workspace"
            icon={Icon.AppWindowList}
            target={<RepoWorkspaceView repo={repo} />}
          />
          <ActionPanel.Section>
            <Action
              title="Remove from Recents"
              icon={Icon.XMarkCircle}
              style={Action.Style.Destructive}
              shortcut={{ modifiers: ["ctrl"], key: "x" }}
              onAction={() => onRemove(repo.path)}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

// --- Helpers ---

async function readRepoMeta(repoPath: string): Promise<RepoMeta> {
  try {
    const [branchOut, statusOut, branchesOut] = await Promise.all([
      execa("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: repoPath }),
      execa("git", ["status", "--porcelain"], { cwd: repoPath }),
      execa(
        "git",
        ["for-each-ref", "--format=%(refname:short)", "refs/heads/"],
        { cwd: repoPath },
      ),
    ]);
    const branch = branchOut.stdout.trim();
    return {
      branch: branch === "HEAD" ? null : branch || null,
      dirty: statusOut.stdout.trim().length > 0,
      branchCount: branchesOut.stdout
        .split("\n")
        .filter((l) => l.trim().length > 0).length,
    };
  } catch (err) {
    return {
      branch: null,
      dirty: false,
      branchCount: 0,
      error: (err as Error).message,
    };
  }
}
