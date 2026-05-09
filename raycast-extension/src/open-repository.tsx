// Side-effect import — must be FIRST so PATH is augmented before any spawn.
import "./lib/path-fix";
import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  Toast,
  showToast,
} from "@raycast/api";
import { execa } from "execa";
import { useCallback, useEffect, useState } from "react";
import { OpenFolderForm } from "./components/open-folder-form";
import { openInEditor } from "./lib/editor";
import { addRecent, loadRecents, removeRecent } from "./lib/recents";
import { RepoWorkspaceView } from "./repo-workspace";
import type { EditorTarget, Repo } from "./lib/types";

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

  const handleOpen = useCallback(
    async (repo: Repo, target: EditorTarget) => {
      try {
        await openInEditor(target, repo.path);
        // Bump to front of recents on successful launch.
        await addRecent({ path: repo.path, name: repo.name });
        void refresh();
      } catch (err) {
        await showToast({
          style: Toast.Style.Failure,
          title: `Couldn’t open ${displayName(target)}`,
          message: (err as Error).message,
        });
      }
    },
    [refresh],
  );

  const handleRemove = useCallback(
    async (repoPath: string) => {
      await removeRecent(repoPath);
      void refresh();
    },
    [refresh],
  );

  const handleAddedFromForm = useCallback(
    (added: Repo) => {
      void refresh();
      // Drop straight into the workspace for the freshly added repo.
      // (Achieved by re-rendering with a fresh list; the user can pick it.)
      void added; // currently unused; placeholder for future "auto-push" UX
    },
    [refresh],
  );

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search recent repos…"
      navigationTitle="Open Repository"
    >
      <List.EmptyView
        icon={Icon.Folder}
        title="No recent repositories"
        description="Open a folder to add it to your recents."
        actions={
          <ActionPanel>
            <Action.Push
              title="Open Folder…"
              icon={Icon.Plus}
              target={<OpenFolderForm onAdded={handleAddedFromForm} />}
            />
          </ActionPanel>
        }
      />
      {recents.map((repo) => (
        <RepoRow
          key={repo.path}
          repo={repo}
          meta={meta[repo.path]}
          onOpen={handleOpen}
          onRemove={handleRemove}
          onAddedFromForm={handleAddedFromForm}
        />
      ))}
    </List>
  );
}

function RepoRow({
  repo,
  meta,
  onOpen,
  onRemove,
  onAddedFromForm,
}: {
  repo: Repo;
  meta: RepoMeta | undefined;
  onOpen: (repo: Repo, target: EditorTarget) => void;
  onRemove: (path: string) => void;
  onAddedFromForm: (repo: Repo) => void;
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
          {/*
           * The FIRST action is Raycast's default ⏎ action. We put Open
           * Workspace first so pressing Enter on a recent drops the user into
           * the worktrees/branches view — usually the next thing they want
           * after picking a repo. Open in <editor> moves to ⌘↵ etc.
           */}
          <ActionPanel.Section title="Workspace">
            <Action.Push
              title="Open Workspace"
              icon={Icon.AppWindowList}
              target={<RepoWorkspaceView repo={repo} />}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Open in">
            <Action
              title="Open in Claude Code"
              icon={Icon.Code}
              shortcut={{ modifiers: ["cmd"], key: "return" }}
              onAction={() => onOpen(repo, "claude")}
            />
            <Action
              title="Open in Cursor"
              icon={Icon.Code}
              shortcut={{ modifiers: ["cmd", "shift"], key: "return" }}
              onAction={() => onOpen(repo, "cursor")}
            />
            <Action
              title="Open in Codex"
              icon={Icon.Code}
              onAction={() => onOpen(repo, "codex")}
            />
            <Action
              title="Open in Zed"
              icon={Icon.Code}
              onAction={() => onOpen(repo, "zed")}
            />
            <Action
              title="Open in Terminal"
              icon={Icon.Terminal}
              shortcut={{ modifiers: ["cmd"], key: "t" }}
              onAction={() => onOpen(repo, "terminal")}
            />
            <Action
              title="Reveal in Finder"
              icon={Icon.Finder}
              shortcut={{ modifiers: ["cmd"], key: "f" }}
              onAction={() => onOpen(repo, "finder")}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Recents">
            <Action.Push
              title="Open Folder…"
              icon={Icon.Plus}
              target={<OpenFolderForm onAdded={onAddedFromForm} />}
            />
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

function displayName(target: EditorTarget): string {
  switch (target) {
    case "cursor":
      return "Cursor";
    case "claude":
      return "Claude Code";
    case "codex":
      return "Codex";
    case "zed":
      return "Zed";
    case "terminal":
      return "Terminal";
    case "finder":
      return "Finder";
  }
}
