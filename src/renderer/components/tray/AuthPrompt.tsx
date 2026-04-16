import React, { useState } from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function AuthPrompt() {
  const { setToken } = usePRStore();
  const [token, setTokenInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setIsSubmitting(true);
    await setToken(token.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="w-full max-w-[300px] space-y-5 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <span className="claude-mark text-mac-accent w-8 h-8 animate-spark" aria-hidden />
          <div className="text-center space-y-1.5">
            <div className="text-[20px] font-display italic text-mac-label leading-none">
              Connect GitHub
            </div>
            <div className="text-[12px] text-mac-label-secondary leading-relaxed">
              Run{' '}
              <span className="font-mono text-[11px] text-mac-label bg-mac-control-bg px-1.5 py-0.5 rounded border border-mac-separator-heavy">
                gh auth login
              </span>{' '}
              — or paste a personal access token.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-3 py-2 text-[13px] rounded-lg
                       bg-mac-control-bg border border-mac-separator-heavy
                       text-mac-label placeholder:text-mac-label-tertiary
                       focus:outline-none focus:border-mac-accent
                       focus:ring-2 focus:ring-mac-accent-soft
                       transition-all font-mono"
          />
          <button
            type="submit"
            disabled={!token.trim() || isSubmitting}
            className="w-full py-2 text-[13px] font-medium rounded-lg
                       bg-mac-accent text-white
                       hover:bg-mac-accent-hover active:bg-mac-accent-active
                       disabled:opacity-40 disabled:hover:bg-mac-accent
                       transition-colors shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]"
          >
            {isSubmitting ? 'Connecting…' : 'Connect'}
          </button>
        </form>

        <div className="text-[10.5px] text-mac-label-tertiary text-center">
          Requires <span className="font-mono">repo</span> + <span className="font-mono">read:org</span> scopes
        </div>
      </div>
    </div>
  );
}
