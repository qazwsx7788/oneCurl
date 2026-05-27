/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'oc-base': 'var(--bg-base)',
        'oc-surface': 'var(--bg-surface)',
        'oc-elevated': 'var(--bg-elevated)',
        'oc-overlay': 'var(--bg-overlay)',
        'oc-border': 'var(--border-default)',
        'oc-border-muted': 'var(--border-muted)',
        'oc-text': 'var(--text-primary)',
        'oc-text-secondary': 'var(--text-secondary)',
        'oc-text-muted': 'var(--text-muted)',
        'oc-accent': 'var(--accent-fg)',
        'oc-success': 'var(--success-fg)',
        'oc-warning': 'var(--warning-fg)',
        'oc-danger': 'var(--danger-fg)',
      },
      spacing: {
        'header': 'var(--header-height)',
        'tab': 'var(--tab-height)',
        'statusbar': 'var(--statusbar-height)',
        'sidebar': 'var(--sidebar-width)',
      },
      borderRadius: {
        'oc': 'var(--radius)',
      },
      fontSize: {
        'xs': ['13px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.5' }],
        'lg': ['16px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}
