import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mac: {
          accent: 'var(--mac-accent)',
          'accent-hover': 'var(--mac-accent-hover)',
          'accent-active': 'var(--mac-accent-active)',
          label: 'var(--mac-label)',
          'label-secondary': 'var(--mac-label-secondary)',
          'label-tertiary': 'var(--mac-label-tertiary)',
          'label-quaternary': 'var(--mac-label-quaternary)',
          'bg-window': 'var(--mac-bg-window)',
          'bg-content': 'var(--mac-bg-content)',
          'bg-sidebar': 'var(--mac-bg-sidebar)',
          'bg-toolbar': 'var(--mac-bg-toolbar)',
          'bg-popover': 'var(--mac-bg-popover)',
          'bg-menu': 'var(--mac-bg-menu)',
          'bg-card': 'var(--mac-bg-card)',
          'bg-card-soft': 'var(--mac-bg-card-soft)',
          'control-bg': 'var(--mac-control-bg)',
          'control-border': 'var(--mac-control-border)',
          'control-active': 'var(--mac-control-bg-active)',
          'control-hover': 'var(--mac-control-bg-hover)',
          separator: 'var(--mac-separator)',
          'separator-heavy': 'var(--mac-separator-heavy)',
          green: 'var(--mac-green)',
          orange: 'var(--mac-orange)',
          red: 'var(--mac-red)',
          purple: 'var(--mac-purple)',
          blue: 'var(--mac-blue)',
          selection: 'var(--mac-selection)',
          'selection-text': 'var(--mac-selection-text)',
          'accent-soft': 'var(--mac-accent-soft)',
          'accent-glow': 'var(--mac-accent-glow)',
          /* Legacy aliases used by tray components */
          danger: 'var(--mac-red)',
          warning: 'var(--mac-orange)',
          success: 'var(--mac-green)',
          primary: 'var(--mac-accent)',
          'primary-hover': 'var(--mac-accent-hover)',
          fill: 'var(--mac-control-bg)',
        },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      boxShadow: {
        menu: 'var(--mac-shadow-menu)',
        dialog: 'var(--mac-shadow-dialog)',
      },
    },
  },
  plugins: [],
};

export default config;
