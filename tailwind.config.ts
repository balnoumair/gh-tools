import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mac: {
          primary: 'var(--mac-primary)',
          'primary-hover': 'var(--mac-primary-hover)',
          label: 'var(--mac-label)',
          'label-secondary': 'var(--mac-label-secondary)',
          'label-tertiary': 'var(--mac-label-tertiary)',
          separator: 'var(--mac-separator)',
          fill: 'var(--mac-fill)',
          'fill-secondary': 'var(--mac-fill-secondary)',
          success: 'var(--mac-success)',
          warning: 'var(--mac-warning)',
          danger: 'var(--mac-danger)',
          purple: 'var(--mac-purple)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
