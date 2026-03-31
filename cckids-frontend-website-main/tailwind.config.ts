// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      colors: {
        cc: {
          pink: '#E91E63',
          cyan: '#00BCD4',
          yellow: '#CDDC39',
          orange: '#FF9800',
          purple: '#9C27B0',
          lime: '#8BC34A',
          bg: '#FFF9F0',
          text: '#2C3E50',
        },
      },
      animation: {
        twinkle: 'twinkle 2s infinite ease-in-out',
        float: 'float 6s infinite ease-in-out',
        wiggle: 'wiggle 3s infinite ease-in-out',
        'bounce-in': 'bounceIn 1s ease-out',
        'gradient-text': 'gradientShift 5s ease infinite',
        'pop-in': 'popIn 0.6s ease backwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out both',
        'slide-in-from-top-5': 'slideInFromTop 0.25s ease-out both',
        'spin-slow': 'spin 3s linear infinite',

        // YASA: yeni animasyonlar
        'slide-up': 'slideUp 0.5s ease-out both',
        'slide-left': 'slideLeft 0.5s ease-out both',
        'slide-right': 'slideRight 0.5s ease-out both',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.4', transform: 'scale(1.3) rotate(180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0) rotate(-180deg)' },
          '50%': { transform: 'scale(1.1) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        slideInFromTop: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },

        // YASA: yeni keyframes
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0px)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0px)' },
        },
        pulseRing: {
          '0%': { opacity: '0.65', transform: 'scale(1)' },
          '70%': { opacity: '0', transform: 'scale(1.6)' },
          '100%': { opacity: '0', transform: 'scale(1.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

