/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: '#FFFFFF',
                surface: '#F8FAFC',
                border: '#F1F5F9',
                primary: '#059669', // Emerald-600
                accent: '#047857', // Emerald-700
                success: '#10B981',
                danger: '#EF4444',
                warning: '#F59E0B',
                'text-primary': '#0F172A',
                'text-muted': '#64748B',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
            borderRadius: {
                card: '16px',
                btn: '10px',
            },
            boxShadow: {
                glow: '0 0 20px rgba(5, 150, 105, 0.15)',
                'glow-accent': '0 0 20px rgba(4, 120, 87, 0.15)',
                'glow-success': '0 0 15px rgba(16, 185, 129, 0.15)',
                'glow-danger': '0 0 15px rgba(239, 68, 68, 0.15)',
                card: '0 8px 30px rgba(0, 0, 0, 0.04)',
                soft: '0 2px 15px rgba(0, 0, 0, 0.02)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'gradient-surface': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'count-up': 'countUp 0.5s ease-out',
                float: 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
        },
    },
    plugins: [],
};
