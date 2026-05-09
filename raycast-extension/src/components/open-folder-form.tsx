import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { detectRepo } from "../lib/git";
import { addRecent } from "../lib/recents";
import type { Repo } from "../lib/types";

interface Props {
  /** Called with the newly added repo so the parent can refresh / push the workspace. */
  onAdded?: (repo: Repo) => void;
}

/**
 * Empty-state companion to the "Open Repository" command. Lets the user pick
 * any folder and adds it to recents (validating it's a git repo first).
 */
export function OpenFolderForm({ onAdded }: Props) {
  const { pop } = useNavigation();
  const [paths, setPaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (paths.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Pick a folder first",
      });
      return;
    }
    setSubmitting(true);
    try {
      const detected = await detectRepo(paths[0]);
      if (!detected) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Not a git repository",
          message: paths[0],
        });
        return;
      }
      const updated = await addRecent({
        path: detected.path,
        name: detected.name,
      });
      const justAdded = updated.find((r) => r.path === detected.path);
      if (justAdded) {
        onAdded?.(justAdded);
        pop();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={submitting}
      navigationTitle="Open Folder"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add to Recents" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker
        id="folder"
        title="Repository folder"
        canChooseDirectories
        canChooseFiles={false}
        allowMultipleSelection={false}
        value={paths}
        onChange={setPaths}
      />
    </Form>
  );
}
