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
          <div className="text-xs text-ghv-text font-medium">Authentication Required</div>
          <div className="text-2xs text-ghv-text-muted leading-relaxed">
            Install{' '}
            <span className="font-mono text-ghv-accent">gh</span> CLI and run{' '}
            <span className="font-mono text-ghv-accent">gh auth login</span>
            <br />
            — or paste a Personal Access Token below.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-ghv-surface border border-ghv-border
                       text-ghv-text placeholder:text-ghv-text-muted
                       focus:outline-none focus:border-ghv-accent/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!token.trim() || isSubmitting}
            className="w-full py-1.5 text-xs font-mono font-medium
                       bg-ghv-accent/10 text-ghv-accent border border-ghv-accent/30
                       hover:bg-ghv-accent/20 hover:border-ghv-accent/60
                       disabled:opacity-30 transition-colors"
          >
            {isSubmitting ? 'connecting...' : 'authenticate'}
          </button>
        </form>

        <div className="text-2xs text-ghv-text-muted text-center font-mono">
          needs: repo, read:org scopes
        </div>
      </div>
    </div>
  );
}
