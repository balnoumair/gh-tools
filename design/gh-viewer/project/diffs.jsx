// diffs.jsx — sample git diffs per PR, keyed by PR number.
// Line types: 'ctx' (context), 'add', 'del'. Hunk headers render as a band.

const D = (type, old, nw, text) => ({ type, old, nw, text });

const SAMPLE_DIFFS = {
  482: {
    base: "main", head: "feat/worktree-pane",
    summary: { files: 3, additions: 142, deletions: 38, commits: 4 },
    files: [
      {
        path: "src/worktree/manager.rs", lang: "rust", status: "modified",
        additions: 64, deletions: 12,
        hunks: [
          { header: "@@ -118,9 +118,12 @@ impl WorktreeManager {", lines: [
            D('ctx', 118, 118, "    /// List every worktree linked to this repository."),
            D('ctx', 119, 119, "    pub fn list(&self) -> Result<Vec<Worktree>> {"),
            D('del', 120, null, "        let entries = self.read_gitdir()?;"),
            D('del', 121, null, "        Ok(entries)"),
            D('add', null, 120, "        let mut entries = self.read_gitdir()?;"),
            D('add', null, 121, "        // orphan worktrees have no upstream — keep them last"),
            D('add', null, 122, "        entries.sort_by_key(|w| (w.is_orphan(), w.path.clone()));"),
            D('add', null, 123, "        Ok(entries)"),
            D('ctx', 122, 124, "    }"),
            D('ctx', 123, 125, ""),
          ]},
          { header: "@@ -204,6 +207,24 @@ impl WorktreeManager {", lines: [
            D('ctx', 204, 207, "    pub fn add(&self, branch: &str) -> Result<Worktree> {"),
            D('ctx', 205, 208, "        let path = self.worktree_path(branch);"),
            D('add', null, 209, ""),
            D('add', null, 210, "        // A branch that points at no commit is an orphan; we still"),
            D('add', null, 211, "        // want to materialize a worktree so the user can start work."),
            D('add', null, 212, "        if self.is_orphan(branch)? {"),
            D('add', null, 213, "            return self.add_orphan(branch, &path);"),
            D('add', null, 214, "        }"),
            D('add', null, 215, ""),
            D('ctx', 206, 216, "        let mut cmd = self.git();"),
            D('del', 207, null, "        cmd.args([\"worktree\", \"add\", &path, branch]);"),
            D('add', null, 217, "        cmd.args([\"worktree\", \"add\", \"--checkout\", &path, branch]);"),
            D('ctx', 208, 218, "        cmd.run()?;"),
            D('ctx', 209, 219, "        Worktree::open(&path)"),
            D('ctx', 210, 220, "    }"),
          ]},
        ],
      },
      {
        path: "src/worktree/orphan.rs", lang: "rust", status: "added",
        additions: 71, deletions: 0,
        hunks: [
          { header: "@@ -0,0 +1,18 @@", lines: [
            D('add', null, 1, "use std::path::Path;"),
            D('add', null, 2, "use crate::git::Git;"),
            D('add', null, 3, ""),
            D('add', null, 4, "/// Create a worktree for a branch with no commits yet."),
            D('add', null, 5, "pub fn add_orphan(git: &Git, branch: &str, path: &Path) -> anyhow::Result<()> {"),
            D('add', null, 6, "    git.run([\"worktree\", \"add\", \"--detach\", path.to_str().unwrap()])?;"),
            D('add', null, 7, "    git.in_dir(path).run([\"switch\", \"--orphan\", branch])?;"),
            D('add', null, 8, "    Ok(())"),
            D('add', null, 9, "}"),
          ]},
        ],
      },
      {
        path: "src/ui/sidebar.tsx", lang: "tsx", status: "modified",
        additions: 7, deletions: 26,
        hunks: [
          { header: "@@ -42,12 +42,4 @@ export function WorktreeRow({ wt }: Props) {", lines: [
            D('ctx', 42, 42, "  return ("),
            D('ctx', 43, 43, "    <div className=\"wt-row\">"),
            D('del', 44, null, "      {wt.dirty ? ("),
            D('del', 45, null, "        <Dot tone=\"warn\" title=\"uncommitted changes\" />"),
            D('del', 46, null, "      ) : ("),
            D('del', 47, null, "        <Dot tone=\"idle\" />"),
            D('del', 48, null, "      )}"),
            D('add', null, 44, "      <Dot tone={wt.dirty ? \"warn\" : \"idle\"} />"),
            D('ctx', 49, 45, "      <span className=\"wt-branch\">{wt.branch}</span>"),
            D('ctx', 50, 46, "    </div>"),
            D('ctx', 51, 47, "  );"),
          ]},
        ],
      },
    ],
  },
  478: {
    base: "main", head: "feat/codex-target",
    summary: { files: 2, additions: 24, deletions: 6, commits: 2 },
    files: [
      {
        path: "src/editors/registry.ts", lang: "ts", status: "modified",
        additions: 16, deletions: 4,
        hunks: [
          { header: "@@ -8,10 +8,16 @@ export const EDITORS: EditorTarget[] = [", lines: [
            D('ctx', 8, 8, "  { id: \"cursor\", label: \"Cursor\",  bin: \"cursor\" },"),
            D('ctx', 9, 9, "  { id: \"zed\",    label: \"Zed\",     bin: \"zed\" },"),
            D('del', 10, null, "  { id: \"claude\", label: \"Claude\", bin: \"claude\" },"),
            D('add', null, 10, "  { id: \"claude\", label: \"Claude Code\", bin: \"claude\" },"),
            D('add', null, 11, "  { id: \"codex\",  label: \"Codex\",  bin: \"codex\" },"),
            D('ctx', 11, 12, "];"),
            D('ctx', 12, 13, ""),
            D('add', null, 14, "export function resolveEditor(id: string) {"),
            D('add', null, 15, "  return EDITORS.find((e) => e.id === id) ?? EDITORS[0];"),
            D('add', null, 16, "}"),
          ]},
        ],
      },
      {
        path: "src/ui/editor-strip.tsx", lang: "tsx", status: "modified",
        additions: 8, deletions: 2,
        hunks: [
          { header: "@@ -31,6 +31,12 @@ function EditorStrip({ path }: Props) {", lines: [
            D('ctx', 31, 31, "      {EDITORS.map((e) => ("),
            D('del', 32, null, "        <EditorButton key={e.id} editor={e} />"),
            D('add', null, 32, "        <EditorButton"),
            D('add', null, 33, "          key={e.id}"),
            D('add', null, 34, "          editor={e}"),
            D('add', null, 35, "          onOpen={() => open(e.bin, path)}"),
            D('add', null, 36, "        />"),
            D('ctx', 33, 37, "      ))}"),
          ]},
        ],
      },
    ],
  },
  1209: {
    base: "main", head: "refactor/stash-context",
    summary: { files: 2, additions: 312, deletions: 287, commits: 6 },
    files: [
      {
        path: "src/ui/stash-drawer.tsx", lang: "tsx", status: "modified",
        additions: 41, deletions: 58,
        hunks: [
          { header: "@@ -1,15 +1,9 @@", lines: [
            D('del', 1, null, "import { Drawer } from \"../components/drawer\";"),
            D('del', 2, null, "import { useStashes } from \"../hooks/stash\";"),
            D('add', null, 1, "import { useBranchContext } from \"../hooks/branch\";"),
            D('ctx', 3, 2, ""),
            D('del', 4, null, "export function StashDrawer() {"),
            D('del', 5, null, "  const stashes = useStashes();"),
            D('add', null, 3, "export function StashList() {"),
            D('add', null, 4, "  const { stashes } = useBranchContext();"),
            D('ctx', 6, 5, "  return ("),
            D('del', 7, null, "    <Drawer title=\"Stashes\">"),
            D('add', null, 6, "    <section className=\"stash-list\">"),
            D('ctx', 8, 7, "      {stashes.map((s) => ("),
            D('ctx', 9, 8, "        <StashRow key={s.id} stash={s} />"),
          ]},
        ],
      },
      {
        path: "src/hooks/branch.ts", lang: "ts", status: "modified",
        additions: 271, deletions: 229,
        hunks: [
          { header: "@@ -54,7 +54,9 @@ export function useBranchContext() {", lines: [
            D('ctx', 54, 54, "  const branch = useCurrentBranch();"),
            D('del', 55, null, "  return { branch };"),
            D('add', null, 55, "  const stashes = useStashes(branch.name);"),
            D('add', null, 56, "  return { branch, stashes };"),
            D('ctx', 56, 57, "}"),
          ]},
        ],
      },
    ],
  },
};

// Fallback diff for PRs without a hand-authored one.
const FALLBACK_DIFF = {
  base: "main", head: "—",
  summary: { files: 1, additions: 0, deletions: 0, commits: 1 },
  files: [
    {
      path: "—", lang: "text", status: "modified", additions: 0, deletions: 0,
      hunks: [{ header: "@@ no preview @@", lines: [
        D('ctx', 1, 1, "// Diff preview not loaded for this PR yet."),
      ]}],
    },
  ],
};

const getDiff = (num) => SAMPLE_DIFFS[num] || FALLBACK_DIFF;

Object.assign(window, { SAMPLE_DIFFS, FALLBACK_DIFF, getDiff });
