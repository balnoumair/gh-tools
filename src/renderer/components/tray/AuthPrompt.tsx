import React, { useState } from 'react';
import { usePRStore } from '../../stores/pr-store';

export default function AuthPrompt() {
  const { setToken, authStatus } = usePRStore();
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
      <div className="w-full max-w-[280px] space-y-4 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="text-[15px] font-semibold text-mac-label">
            Authentication Required
          </div>
          <div className="text-[13px] text-mac-label-secondary leading-relaxed">
            Install{' '}
            <span className="font-mono text-[12px] bg-mac-fill/60 px-1 py-0.5 rounded">gh</span> CLI and run{' '}
            <span className="font-mono text-[12px] bg-mac-fill/60 px-1 py-0.5 rounded">gh auth login</span>
            <br />
            — or paste a Personal Access Token below.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <input
            type="password"
            value={token}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-3 py-2 text-[13px] rounded-lg
                       bg-mac-fill/50 border border-mac-separator
                       text-mac-label placeholder:text-mac-label-tertiary
                       focus:outline-none focus:ring-2 focus:ring-mac-primary/50 focus:border-mac-primary
                       transition-colors"
          />
          <button
            type="submit"
            disabled={!token.trim() || isSubmitting}
            className="w-full py-2 text-[13px] font-medium rounded-lg
                       bg-mac-primary text-white
                       hover:bg-mac-primary-hover active:brightness-90
                       disabled:opacity-40 transition-colors"
          >
            {isSubmitting ? 'Connecting...' : 'Authenticate'}
          </button>
        </form>

        <div className="text-[11px] text-mac-label-tertiary text-center">
          Requires repo and read:org scopes
        </div>
      </div>
    </div>
  );
}
