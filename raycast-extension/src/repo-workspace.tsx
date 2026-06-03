// Side-effect import — must be FIRST so PATH is augmented before any spawn.
import "./lib/path-fix";
import {
  Action,
  ActionPanel,
  Alert,
  Color,
  Icon,
  type KeyEquivalent,
  type KeyModifier,
  List,
  Toast,
  confirmAlert,
  showToast,
} from "@raycast/api";
import path from "node:path";
import { useCallback, useEffect, useState } from "react";
import { CommitForm } from "./components/commit-form";
import { CreateWorktreeForm } from "./components/create-worktree-form";
import { OpenInGhViewerAction } from "./components/open-in-gh-viewer-action";
import { addRecent } from "./lib/recents";
import {
  checkoutInPrimary,
  deleteBranch,
  listBranches,
  listWorktrees,
  mergeMainInto,
  pullWorktree,
  pushWorktree,
  removeWorktree,
} from "./lib/git";
import { openInEditor } from "./lib/editor";
import { editorActionIcon } from "./lib/editor-icons";
import type { Branch, EditorTarget, Repo, Worktree } from "./lib/types";

// NOTE: This file is no longer registered as a Raycast command (see
// `package.json` → `commands[]`). It exposes `RepoWorkspaceView` as a regular
// React component, rendered via `Action.Push` from `open-repository.tsx`.
// If you ever want to re-expose it as a top-level Raycast command, add an entry
// back to `commands[]` and restore a default export here.

interface ViewProps {
  repo: Repo;
}

export function RepoWorkspaceView({ repo }: ViewProps) {
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [wts, brs] = await Promise.all([
        listWorktrees(repo.path),
        listBranches(repo.path),
      ]);
      setWorktrees(wts);
      setBranches(brs);
    } catch (err) {
      // Surface as much detail as possible — both to the toast (truncated by
      // Raycast) and to the dev console (full).
      const e = err as { message?: string; stderr?: string; stack?: string };
      // eslint-disable-next-line no-console
      console.error("[repo-workspace] Failed to read repository:", {
        repoPath: repo.path,
        message: e.message,
        stderr: e.stderr,
        stack: e.stack,
      });
      await showToast({
        style: Toast.Style.Failure,
        title: `Failed to read ${repo.name}`,
        message: e.stderr?.trim() || e.message || "unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, [repo.path, repo.name]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void addRecent({ path: repo.path, name: repo.name });
  }, [repo.path, repo.name]);

  const primary =
    worktrees.find((w) => w.isPrimary) ??
    worktrees.find((w) => path.resolve(w.path) === path.resolve(repo.path));
  const linkedWorktrees = worktrees.filter(
    (w) => !primary || path.resolve(w.path) !== path.resolve(primary.path),
  );
  const orphanBranches = branches.filter((b) => !b.hasWorktree);

  return (
    <List
      isLoading={loading}
      navigationTitle={repo.name}
      searchBarPlaceholder="Filter checkout, worktrees, and branches…"
    >
      {primary && (
        <List.Section title="Repository">
          <PrimaryCheckoutRow
            repo={repo}
            wt={primary}
            onChange={refresh}
          />
        </List.Section>
      )}
      <List.Section title="Worktrees" subtitle={String(linkedWorktrees.length)}>
        {linkedWorktrees.map((wt) => (
          <WorktreeRow key={wt.path} repo={repo} wt={wt} onChange={refresh} />
        ))}
      </List.Section>
      <List.Section title="Local" subtitle={String(orphanBranches.length)}>
        {orphanBranches.map((b) => (
          <BranchRow key={b.name} repo={repo} branch={b} onChange={refresh} />
        ))}
      </List.Section>
    </List>
  );
}

// --- Rows ---

function PrimaryCheckoutRow({
  repo,
  wt,
  onChange,
}: {
  repo: Repo;
  wt: Worktree;
  onChange: () => void;
}) {
  const branchLabel = wt.branch ?? `(detached @ ${wt.head})`;
  const shortPath = path.basename(wt.path);
  const aheadBehind = formatAheadBehind(wt.ahead, wt.behind);

  const accessories: List.Item.Accessory[] = [
    { tag: { value: "local", color: Color.Blue } },
    wt.dirty
      ? { tag: { value: "dirty", color: Color.Yellow } }
      : { tag: { value: "clean", color: Color.SecondaryText } },
  ];

  return (
    <List.Item
      title={branchLabel}
      subtitle={
        aheadBehind ? `${shortPath} · ${aheadBehind}` : `${shortPath} · ${repo.path}`
      }
      accessories={accessories}
      keywords={[wt.path, branchLabel, repo.path]}
      actions={
        <PrimaryCheckoutActions repo={repo} wt={wt} onChange={onChange} />
      }
    />
  );
}

function WorktreeRow({
  repo,
  wt,
  onChange,
}: {
  repo: Repo;
  wt: Worktree;
  onChange: () => void;
}) {
  const branchLabel = wt.branch ?? `(detached @ ${wt.head})`;
  const shortPath = path.basename(wt.path);
  const aheadBehind = formatAheadBehind(wt.ahead, wt.behind);

  const accessories: List.Item.Accessory[] = [
    wt.dirty
      ? { tag: { value: "dirty", color: Color.Yellow } }
      : { tag: { value: "clean", color: Color.SecondaryText } },
  ];

  return (
    <List.Item
      title={branchLabel}
      subtitle={aheadBehind ? `${shortPath} · ${aheadBehind}` : shortPath}
      accessories={accessories}
      keywords={[wt.path, branchLabel]}
      actions={<WorktreeActions repo={repo} wt={wt} onChange={onChange} />}
    />
  );
}

function BranchRow({
  repo,
  branch,
  onChange,
}: {
  repo: Repo;
  branch: Branch;
  onChange: () => void;
}) {
  return (
    <List.Item
      title={branch.name}
      subtitle={branch.head}
      accessories={[
        { tag: { value: "no worktree", color: Color.SecondaryText } },
      ]}
      keywords={[branch.name]}
      actions={
        <BranchActions repo={repo} branch={branch} onChange={onChange} />
      }
    />
  );
}

const CREATE_WORKTREE_SHORTCUT = {
  modifiers: ["cmd"] as KeyModifier[],
  key: "n" as KeyEquivalent,
};

function CreateWorktreeAction({
  repoPath,
  branch,
  onCreated,
}: {
  repoPath: string;
  branch: string;
  onCreated: () => void;
}) {
  return (
    <Action.Push
      title="Create Worktree…"
      icon={Icon.Plus}
      shortcut={CREATE_WORKTREE_SHORTCUT}
      target={
        <CreateWorktreeForm
          repoPath={repoPath}
          branch={branch}
          onCreated={onCreated}
        />
      }
    />
  );
}

// --- Action panels ---

function PrimaryCheckoutActions({
  repo,
  wt,
  onChange,
}: {
  repo: Repo;
  wt: Worktree;
  onChange: () => void;
}) {
  return (
    <ActionPanel>
      <ActionPanel.Section title="Open in">
        <OpenInAction target="claude" displayName="Claude Code" path={wt.path} />
        <OpenInAction
          target="cursor"
          displayName="Cursor"
          path={wt.path}
          shortcut={{ modifiers: ["cmd"], key: "return" }}
        />
        <OpenInAction target="codex" displayName="Codex" path={wt.path} />
        <OpenInAction target="zed" displayName="Zed" path={wt.path} />
        <OpenInAction
          target="terminal"
          displayName="Terminal"
          path={wt.path}
          shortcut={{ modifiers: ["cmd"], key: "t" }}
        />
        <OpenInAction
          target="finder"
          displayName="Finder"
          path={wt.path}
          shortcut={{ modifiers: ["cmd"], key: "f" }}
          actionTitle="Reveal in Finder"
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="App">
        <OpenInGhViewerAction repo={repo} />
      </ActionPanel.Section>
      {wt.branch && (
        <ActionPanel.Section title="Worktree">
          <CreateWorktreeAction
            repoPath={repo.path}
            branch={wt.branch}
            onCreated={onChange}
          />
        </ActionPanel.Section>
      )}
      <ActionPanel.Section title="Git">
        <Action.Push
          title="Commit Changes…"
          icon={Icon.Pencil}
          shortcut={{ modifiers: ["cmd"], key: "c" }}
          target={
            <CommitForm
              worktreePath={wt.path}
              branchLabel={wt.branch ?? wt.head}
              onCommitted={onChange}
            />
          }
        />
        <Action
          title="Push"
          icon={Icon.ArrowUp}
          shortcut={{ modifiers: ["cmd"], key: "u" }}
          onAction={() => runGit("Push", () => pushWorktree(wt.path), onChange)}
        />
        <Action
          title="Pull"
          icon={Icon.ArrowDown}
          onAction={() => runGit("Pull", () => pullWorktree(wt.path), onChange)}
        />
        <Action
          title="Merge Main → Branch"
          icon={Icon.ArrowDownCircle}
          onAction={() =>
            runGit("Merge from main", () => mergeMainInto(wt.path), onChange)
          }
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

function WorktreeActions({
  repo,
  wt,
  onChange,
}: {
  repo: Repo;
  wt: Worktree;
  onChange: () => void;
}) {
  return (
    <ActionPanel>
      <ActionPanel.Section title="Open in">
        <OpenInAction target="claude" displayName="Claude Code" path={wt.path} />
        <OpenInAction
          target="cursor"
          displayName="Cursor"
          path={wt.path}
          shortcut={{ modifiers: ["cmd"], key: "return" }}
        />
        <OpenInAction target="codex" displayName="Codex" path={wt.path} />
        <OpenInAction target="zed" displayName="Zed" path={wt.path} />
        <OpenInAction
          target="terminal"
          displayName="Terminal"
          path={wt.path}
          shortcut={{ modifiers: ["cmd"], key: "t" }}
        />
        <OpenInAction
          target="finder"
          displayName="Finder"
          path={wt.path}
          shortcut={{ modifiers: ["cmd"], key: "f" }}
          actionTitle="Reveal in Finder"
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="App">
        <OpenInGhViewerAction repo={repo} />
      </ActionPanel.Section>
      <ActionPanel.Section title="Git">
        <Action.Push
          title="Commit Changes…"
          icon={Icon.Pencil}
          shortcut={{ modifiers: ["cmd"], key: "c" }}
          target={
            <CommitForm
              worktreePath={wt.path}
              branchLabel={wt.branch ?? wt.head}
              onCommitted={onChange}
            />
          }
        />
        <Action
          title="Push"
          icon={Icon.ArrowUp}
          shortcut={{ modifiers: ["cmd"], key: "u" }}
          onAction={() => runGit("Push", () => pushWorktree(wt.path), onChange)}
        />
        <Action
          title="Pull"
          icon={Icon.ArrowDown}
          onAction={() => runGit("Pull", () => pullWorktree(wt.path), onChange)}
        />
        <Action
          title="Merge Main → Branch"
          icon={Icon.ArrowDownCircle}
          onAction={() =>
            runGit("Merge from main", () => mergeMainInto(wt.path), onChange)
          }
        />
        <Action
          title="Remove Worktree"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          shortcut={{ modifiers: ["cmd"], key: "delete" }}
          onAction={() => confirmRemove(repo.path, wt, onChange)}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

function BranchActions({
  repo,
  branch,
  onChange,
}: {
  repo: Repo;
  branch: Branch;
  onChange: () => void;
}) {
  // Action order = Raycast menu order. First action is the default ⏎ target.
  return (
    <ActionPanel>
      <ActionPanel.Section title="Branch">
        <CreateWorktreeAction
          repoPath={repo.path}
          branch={branch.name}
          onCreated={onChange}
        />
        <Action
          title="Checkout in Repository"
          icon={Icon.Switch}
          onAction={() =>
            runGit(
              `Checkout ${branch.name}`,
              () => checkoutInPrimary(repo.path, branch.name),
              onChange,
            )
          }
        />
        <Action
          title="Delete Branch"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          shortcut={{ modifiers: ["cmd"], key: "delete" }}
          onAction={() => confirmDeleteBranch(repo.path, branch, onChange)}
        />
        <Action
          title="Force Delete Branch"
          icon={Icon.Trash}
          style={Action.Style.Destructive}
          shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
          onAction={() =>
            confirmDeleteBranch(repo.path, branch, onChange, true)
          }
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="Open in">
        <OpenInAction
          target="claude"
          displayName="Claude Code"
          path={repo.path}
        />
        <OpenInAction
          target="cursor"
          displayName="Cursor"
          path={repo.path}
          shortcut={{ modifiers: ["cmd"], key: "return" }}
        />
        <OpenInAction target="codex" displayName="Codex" path={repo.path} />
        <OpenInAction target="zed" displayName="Zed" path={repo.path} />
      </ActionPanel.Section>
      <ActionPanel.Section title="App">
        <OpenInGhViewerAction
          repo={repo}
          shortcut={{ modifiers: ["cmd"], key: "g" }}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

// --- Action helpers ---

function OpenInAction({
  target,
  displayName,
  path: targetPath,
  shortcut,
  actionTitle,
}: {
  target: EditorTarget;
  displayName: string;
  path: string;
  shortcut?: { modifiers: ("cmd" | "shift" | "opt" | "ctrl")[]; key: string };
  actionTitle?: string;
}) {
  return (
    <Action
      title={actionTitle ?? `Open in ${displayName}`}
      icon={editorActionIcon(target)}
      // @ts-expect-error Raycast types accept the keyboard shortcut shape we're using.
      shortcut={shortcut}
      onAction={async () => {
        try {
          await openInEditor(target, targetPath);
        } catch (err) {
          await showToast({
            style: Toast.Style.Failure,
            title: `Couldn’t open ${displayName}`,
            message: (err as Error).message,
          });
        }
      }}
    />
  );
}

async function runGit(
  label: string,
  op: () => Promise<unknown>,
  onDone: () => void,
) {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: `${label}…`,
  });
  try {
    await op();
    toast.style = Toast.Style.Success;
    toast.title = `${label} complete`;
    onDone();
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr;
    toast.style = Toast.Style.Failure;
    toast.title = `${label} failed`;
    toast.message = stderr || (err as Error).message;
  }
}

async function confirmDeleteBranch(
  repoPath: string,
  branch: Branch,
  onDone: () => void,
  force = false,
) {
  const ok = await confirmAlert({
    title: force ? `Force delete ${branch.name}?` : `Delete ${branch.name}?`,
    message: force
      ? "Unmerged commits on this branch will be lost."
      : "Only succeeds if the branch is fully merged.",
    primaryAction: {
      title: force ? "Force Delete" : "Delete",
      style: Alert.ActionStyle.Destructive,
    },
  });
  if (!ok) return;

  const label = force ? "Force delete branch" : "Delete branch";
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: `${label}…`,
  });

  try {
    await deleteBranch(repoPath, branch.name, force);
    toast.style = Toast.Style.Success;
    toast.title = `Deleted ${branch.name}`;
    onDone();
  } catch (err) {
    if (!force) {
      const stderr = (err as { stderr?: string }).stderr;
      const offerForce = await confirmAlert({
        title: "Branch not fully merged",
        message:
          stderr?.trim() ||
          "Delete anyway? Unmerged commits will be lost.",
        primaryAction: {
          title: "Force Delete",
          style: Alert.ActionStyle.Destructive,
        },
      });
      if (!offerForce) {
        toast.style = Toast.Style.Failure;
        toast.title = "Delete failed";
        toast.message = stderr || (err as Error).message;
        return;
      }
      try {
        await deleteBranch(repoPath, branch.name, true);
        toast.style = Toast.Style.Success;
        toast.title = `Force-deleted ${branch.name}`;
        onDone();
      } catch (err2) {
        toast.style = Toast.Style.Failure;
        toast.title = "Force delete failed";
        toast.message =
          (err2 as { stderr?: string }).stderr || (err2 as Error).message;
      }
    } else {
      toast.style = Toast.Style.Failure;
      toast.title = "Force delete failed";
      toast.message =
        (err as { stderr?: string }).stderr || (err as Error).message;
    }
  }
}

async function confirmRemove(
  repoPath: string,
  wt: Worktree,
  onDone: () => void,
) {
  const ok = await confirmAlert({
    title: `Remove worktree ${path.basename(wt.path)}?`,
    message: wt.path,
    primaryAction: { title: "Remove", style: Alert.ActionStyle.Destructive },
  });
  if (!ok) return;
  try {
    await removeWorktree(repoPath, wt.path, false);
    await showToast({ style: Toast.Style.Success, title: "Worktree removed" });
    onDone();
  } catch (err) {
    if (wt.dirty) {
      // Git refused because of uncommitted changes — offer a force second-confirm.
      const force = await confirmAlert({
        title: "Worktree is dirty — force remove?",
        message: "Uncommitted changes will be lost.",
        primaryAction: {
          title: "Force Remove",
          style: Alert.ActionStyle.Destructive,
        },
      });
      if (!force) return;
      try {
        await removeWorktree(repoPath, wt.path, true);
        await showToast({
          style: Toast.Style.Success,
          title: "Worktree force-removed",
        });
        onDone();
      } catch (err2) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Force remove failed",
          message: (err2 as Error).message,
        });
      }
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Remove failed",
        message: (err as Error).message,
      });
    }
  }
}

function formatAheadBehind(
  ahead: number | null,
  behind: number | null,
): string | null {
  if (ahead === null || behind === null) return null;
  if (ahead === 0 && behind === 0) return "up to date";
  const parts: string[] = [];
  if (ahead > 0) parts.push(`↑${ahead}`);
  if (behind > 0) parts.push(`↓${behind}`);
  return parts.join(" ");
}

