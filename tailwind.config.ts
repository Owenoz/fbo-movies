import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        galaxy: {
          50:  '#f0e6ff',
          100: '#d9b8ff',
          200: '#c28aff',
          300: '#ab5cff',
          400: '#9433ff',
          500: '#7b00ff',
          600: '#6200cc',
          700: '#4a0099',
          800: '#310066',
          900: '#190033',
          950: '#0d001a',
        },
        nebula: {
          pink:   '#ff2d78',
          purple: '#9333ea',
          blue:   '#3b82f6',
          cyan:   '#06b6d4',
          gold:   '#f59e0b',
        },
        glass: {
          white:  'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.12)',
          hover:  'rgba(255,255,255,0.14)',
        },
      },
      backgroundImage: {
        'galaxy-bg':    'radial-gradient(ellipse at 20% 50%, #190033 0%, #0d001a 40%, #000000 100%)',
        'nebula-glow':  'radial-gradient(circle at 50% 50%, rgba(147,51,234,0.3) 0%, transparent 70%)',
        'aurora':       'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
        'card-glass':   'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'hero-overlay': 'linear-gradient(to right, rgba(13,0,26,0.95) 0%, rgba(13,0,26,0.6) 60%, transparent 100%)',
        'lightning':    'linear-gradient(90deg, transparent, rgba(147,51,234,0.8), rgba(59,130,246,0.8), transparent)',
      },
      fontFamily: {
        sans:     ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-slow':   'pulse 4s ease-in-out infinite',
        'spin-slow':    'spin 20s linear infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'lightning':    'lightning 4s ease-in-out infinite',
        'star-twinkle': 'starTwinkle 3s ease-in-out infinite',
        'nebula-drift': 'nebulaDrift 15s ease-in-out infinite',
        'slide-up':     'slideUp 0.5s ease-out',
        'fade-in':      'fadeIn 0.6s ease-out',
        'scale-in':     'scaleIn 0.4s ease-out',
        'liquid':       'liquid 8s ease-in-out infinite',
        'aurora-shift': 'auroraShift 10s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147,51,234,0.3), 0 0 40px rgba(147,51,234,0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(147,51,234,0.6), 0 0 80px rgba(147,51,234,0.3)' },
        },
        lightning: {
          '0%, 90%, 100%': { opacity: '0' },
          '92%, 96%':      { opacity: '1' },
          '94%':           { opacity: '0.5' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.3', transform: 'scale(0.8)' },
        },
        nebulaDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%':      { transform: 'translate(-20px, 15px) scale(0.98)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        liquid: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        auroraShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass':         '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover':   '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        'glow-purple':   '0 0 30px rgba(147,51,234,0.5), 0 0 60px rgba(147,51,234,0.2)',
        'glow-blue':     '0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2)',
        'glow-pink':     '0 0 30px rgba(255,45,120,0.5), 0 0 60px rgba(255,45,120,0.2)',
        'card':          '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover':    '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(147,51,234,0.3)',
      },
    },
  },
  plugins: [],
}
export default config
