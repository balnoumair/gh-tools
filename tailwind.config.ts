import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ghv: {
          bg: '#0a0a0a',
          surface: '#141414',
          'surface-hover': '#1a1a1a',
          border: '#1e1e1e',
          'border-bright': '#2a2a2a',
          text: '#e0e0e0',
          'text-dim': '#707070',
          'text-muted': '#505050',
          accent: '#00e5ff',
          'accent-dim': '#00b8d4',
          warning: '#ffab00',
          success: '#22c55e',
          error: '#ef4444',
          draft: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '2px',
        md: '3px',
        lg: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
