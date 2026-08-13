import type { Config } from 'tailwindcss';

// Signature: the perforated boarding-pass stub, used on the seat map and
// confirmation screens. Everything else stays quiet — navy + cream + one
// amber accent — so that signature is the thing people remember.
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#101A33', 900: '#0B1326', 800: '#101A33', 700: '#1B2A4D' },
        cream: '#F7F4EC',
        amber: { DEFAULT: '#E8A33D', 600: '#CC8A2A' },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      borderRadius: { ticket: '4px' },
    },
  },
  plugins: [],
} satisfies Config;
