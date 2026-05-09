import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  useNavigation,
} from "@raycast/api";
import path from "node:path";
import { useState } from "react";
import { createWorktree } from "../lib/git";

interface Props {
  repoPath: string;
  branch: string;
  onCreated?: () => void;
}

export function CreateWorktreeForm({ repoPath, branch, onCreated }: Props) {
  const { pop } = useNavigation();
  // Default target: sibling directory next to the repo, named `<repo>-<branch-slug>`.
  const defaultTarget = (() => {
    const repoName = path.basename(repoPath);
    const slug = branch.replace(/[^a-zA-Z0-9._-]+/g, "-");
    return path.join(path.dirname(repoPath), `${repoName}-${slug}`);
  })();

  const [target, setTarget] = useState(defaultTarget);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!target.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Target path is required",
      });
      return;
    }
    setSubmitting(true);
    try {
      await createWorktree(repoPath, branch, target.trim());
      await showToast({
        style: Toast.Style.Success,
        title: `Worktree created at ${target.trim()}`,
      });
      onCreated?.();
      pop();
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr;
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to create worktree",
        message: stderr || (err as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={submitting}
      navigationTitle={`Create worktree for ${branch}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Worktree" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`Branch: ${branch}\nRepository: ${repoPath}`} />
      <Form.TextField
        id="target"
        title="Worktree path"
        placeholder="/absolute/path/for/new/worktree"
        value={target}
        onChange={setTarget}
        autoFocus
      />
    </Form>
  );
}
