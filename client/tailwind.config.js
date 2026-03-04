/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    light: 'var(--color-secondary-light)',
                    dark: 'var(--color-secondary-dark)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    dark: 'var(--color-accent-dark)',
                },
                sky: 'var(--color-sky)',
                earth: 'var(--color-earth)',
                bg: {
                    primary: 'var(--color-bg-primary)',
                    secondary: 'var(--color-bg-secondary)',
                    card: 'var(--color-bg-card)',
                },
                text: {
                    primary: 'var(--color-text-primary)',
                    secondary: 'var(--color-text-secondary)',
                    muted: 'var(--color-text-muted)',
                },
                border: 'var(--color-border)',
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                body: ['DM Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                card: '0 2px 8px var(--color-shadow)',
                'card-hover': '0 8px 24px var(--color-shadow)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            maxWidth: {
                container: '1280px',
            },
        },
    },
    plugins: [],
};
