import { create } from 'zustand';
import type { PullRequest, AuthStatus } from '@shared/types';

interface PRStore {
  prs: PullRequest[];
  authStatus: AuthStatus | null;
  lastRefreshed: Date | null;
  isRefreshing: boolean;
  error: string | null;

  setPRs: (prs: PullRequest[]) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setRefreshing: (v: boolean) => void;
  setError: (err: string | null) => void;

  fetchPRs: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
}

export const usePRStore = create<PRStore>((set) => ({
  prs: [],
  authStatus: null,
  lastRefreshed: null,
  isRefreshing: false,
  error: null,

  setPRs: (prs) => set({ prs, lastRefreshed: new Date(), error: null }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error }),

  fetchPRs: async () => {
    set({ isRefreshing: true });
    try {
      const prs = await window.electronAPI.getPRs();
      set({ prs, lastRefreshed: new Date(), isRefreshing: false, error: null });
    } catch (err) {
      set({ isRefreshing: false, error: 'Failed to fetch PRs' });
    }
  },

  forceRefresh: async () => {
    set({ isRefreshing: true });
    try {
      const prs = await window.electronAPI.forceRefresh();
      set({ prs, lastRefreshed: new Date(), isRefreshing: false, error: null });
    } catch (err) {
      set({ isRefreshing: false, error: 'Failed to refresh' });
    }
  },

  checkAuth: async () => {
    try {
      const authStatus = await window.electronAPI.getAuthStatus();
      set({ authStatus });
    } catch {
      set({ authStatus: { authenticated: false, username: null, source: null } });
    }
  },

  setToken: async (token: string) => {
    try {
      const authStatus = await window.electronAPI.setToken(token);
      set({ authStatus });
    } catch {
      set({ error: 'Failed to set token' });
    }
  },
}));
