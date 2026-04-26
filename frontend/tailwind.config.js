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
        obsidian: {
          DEFAULT: '#09090B',
          950: '#09090B',
        },
        accent: {
          DEFAULT: '#FF5F1F',
          dim: '#E6511A',
          glow: '#FF8A58',
          success: '#8dcdff', // Technical blue instead of generic green
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        surface: {
          DEFAULT: '#18181B',
          0: '#09090B',
          1: '#18181B',
          2: '#27272A',
          3: '#3F3F46',
          4: '#52525B',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.15)',
        'glow-success': '0 0 15px rgba(16, 185, 129, 0.4)',
        'glow-warning': '0 0 15px rgba(245, 158, 11, 0.4)',
        'glow-danger': '0 0 15px rgba(239, 68, 68, 0.4)',
        'glass': 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
        'glass-sm': 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3)',
        'panel': '0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'border-travel': 'borderTravel 4s linear infinite',
        'flicker': 'flicker 0.15s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'data-pulse': 'dataPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        borderTravel: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        flicker: {
          '0%': { opacity: '0', transform: 'translateX(-4px)' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        dataPulse: {
          '0%': { offsetDistance: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { offsetDistance: '100%', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
