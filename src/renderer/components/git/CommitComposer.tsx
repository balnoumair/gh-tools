import React, { useState } from 'react';

interface Props {
  ahead: number;
  stagedCount: number;
  onCommit: (message: string, alsoPush?: boolean) => Promise<void>;
  onCancel: () => void;
}

export default function CommitComposer({ ahead, stagedCount, onCommit, onCancel }: Props) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (alsoPush = false) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setSubmitting(true);
    await onCommit(trimmed, alsoPush);
    setSubmitting(false);
    setMessage('');
  };

  return (
    <div className="mt-2 rounded-md bg-black/20 border border-mac-separator-heavy p-2">
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Commit message"
        className="mac-input w-full min-h-[64px] resize-none text-[12px]"
      />
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10.5px] text-mac-label-tertiary font-mono">
          {stagedCount} staged · ↑{ahead}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-[11.5px] text-mac-label-secondary hover:text-mac-label"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!message.trim() || submitting}
          onClick={() => submit(false)}
          className="px-2.5 py-1 rounded bg-white text-[#171717] text-[11.5px] font-medium disabled:opacity-35"
        >
          Commit
        </button>
        <button
          type="button"
          disabled={!message.trim() || submitting}
          onClick={() => submit(true)}
          className="px-2 py-1 rounded bg-white/10 text-mac-label text-[11.5px] font-medium disabled:opacity-35"
        >
          & Push
        </button>
      </div>
    </div>
  );
}
