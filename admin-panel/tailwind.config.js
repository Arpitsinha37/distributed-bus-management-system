/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    500: '#14b8a6', // Teal 500
                    600: '#0d9488', // Teal 600
                    700: '#0f766e',
                    900: '#134e4a',
                },
                sidebar: {
                    light: 'rgba(255, 255, 255, 0.4)',
                    dark: 'rgba(40, 36, 61, 0.4)',
                    hoverLight: 'rgba(255, 255, 255, 0.6)',
                    hoverDark: 'rgba(49, 45, 75, 0.6)',
                },
                materio: {
                    bgLight: '#e0f2fe', // Soft blue for gradient background mix
                    bgDark: '#0f172a',
                    surfaceLight: 'rgba(255, 255, 255, 0.4)',
                    surfaceDark: 'rgba(30, 41, 59, 0.4)',
                    textLight: '#334155',
                    textDark: '#e2e8f0'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'materio': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'materio-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            }
        },
    },
    plugins: [],
};
