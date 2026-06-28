import type React from 'react';

/** Cool-dark tokens shared by the Review desktop app and menubar popover. */
export const CC_THEME = {
  '--gh-bg-0': '#0a0b0d',
  '--gh-bg-1': '#17181c',
  '--gh-bg-2': '#101116',
  '--gh-bg-3': '#1e2026',
  '--gh-bg-4': '#23252c',
  '--gh-line-1': 'rgba(255,255,255,0.05)',
  '--gh-line-2': 'rgba(255,255,255,0.09)',
  '--gh-line-3': 'rgba(255,255,255,0.14)',
  '--gh-fg-1': '#ECEDEF',
  '--gh-fg-2': '#A4A9B2',
  '--gh-fg-3': '#71767E',
  '--gh-fg-4': '#4B505A',
  '--gh-success': '#6fcf97',
  '--gh-danger': '#e98b8b',
  '--gh-warn': '#d9c98a',
  '--gh-info': '#8fa6e6',
  '--cc-accent': '#8b8ff0',
  '--cc-accent-soft': 'rgba(139,143,240,0.15)',
  '--cc-accent-line': 'rgba(139,143,240,0.40)',
} as React.CSSProperties;

/** Menubar popover chrome — matches popover-claude.jsx / Review app surfaces. */
export const CC_POPOVER_SHELL: React.CSSProperties = {
  ...CC_THEME,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
  background: 'var(--gh-bg-2)',
  backdropFilter: 'blur(40px) saturate(150%)',
  WebkitBackdropFilter: 'blur(40px) saturate(150%)',
  border: '1px solid var(--gh-line-2)',
  borderRadius: 16,
  boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
};
