/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f1117',
        'bg-surface': '#1a1d27',
        'bg-surface-elevated': '#252836',
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'accent': '#818cf8',
        'accent-hover': '#6366f1',
        'border': '#3f3f50',
        'border-light': '#52526b',
        'person': '#60a5fa',
        'object': '#f59e0b',
        'place': '#10b981',
        'group': '#a78bfa',
        'amicable': '#22c55e',
        'neutral': '#6b7280',
        'antagonistic': '#ef4444',
        'danger': '#ef4444',
        'danger-hover': '#dc2626',
      }
    },
  },
  plugins: [],
}
