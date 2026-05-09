import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { commitInWorktree } from "../lib/git";

interface Props {
  worktreePath: string;
  branchLabel: string;
  /** Called after a successful commit so the parent can refresh. */
  onCommitted?: () => void;
}

export function CommitForm({ worktreePath, branchLabel, onCommitted }: Props) {
  const { pop } = useNavigation();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Commit message is required",
      });
      return;
    }
    setSubmitting(true);
    try {
      await commitInWorktree(worktreePath, message.trim());
      await showToast({
        style: Toast.Style.Success,
        title: `Committed on ${branchLabel}`,
      });
      onCommitted?.();
      pop();
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr;
      await showToast({
        style: Toast.Style.Failure,
        title: "Commit failed",
        message: stderr || (err as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={submitting}
      navigationTitle={`Commit changes on ${branchLabel}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Commit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`Worktree: ${worktreePath}`} />
      <Form.TextArea
        id="message"
        title="Commit message"
        placeholder="Describe the change…"
        value={message}
        onChange={setMessage}
        autoFocus
      />
    </Form>
  );
}
