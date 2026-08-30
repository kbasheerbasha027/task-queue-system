/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        'dark': {
          900: '#0a0e27',
          850: '#0f1438',
          800: '#141b35',
          700: '#1a2347',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 90deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%22100%22 y2=%22100%22%3E%3Cstop offset=%220%25%22 stop-color=%22%2306b6d4%22 stop-opacity=%220.1%22/%3E%3Cstop offset=%2250%25%22 stop-color=%22%238b5cf6%22 stop-opacity=%220.1%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%23ec4899%22 stop-opacity=%220.1%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23g)%22/%3E%3C/svg%3E")',
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
        'glow-purple': '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)',
        'glow-green': '0 0 30px rgba(34, 197, 94, 0.3), 0 0 60px rgba(34, 197, 94, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
