import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#ff7e35', // Main orange for text, headings, buttons
          light: '#ff9a5c', // Hover states or light mode accent
          dark: '#e66a1a', // Deep variant for focus or active states
        },
        accent: {
          DEFAULT: '#ff7e35', // Warm orange accent (for highlights / hover)
          light: '#ff9a5c',
          dark: '#e66a1a',
        },

        // Neutral Palette
        neutral: {
          light: '#F7F5F2', // Background or section backgrounds
          DEFAULT: '#E5E3DF', // Subtle gray-beige for separators
          dark: '#1A1A1A', // Main text / dark background mode
        },

        // Text Colors
        text: {
          primary: '#1A1A1A', // Headings, body text
          muted: '#6B6B6B', // Secondary info or captions
          onDark: '#F7F5F2', // Light text on dark backgrounds
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        serif: ['Instrument Serif', 'serif'],
        'roboto-flex': ['Roboto Flex', 'sans-serif'],
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
