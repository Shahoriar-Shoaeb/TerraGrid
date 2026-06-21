/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: '#0F1117',
                surface: '#1A1D27',
                border: '#2A2D3E',
                primary: '#6C63FF',
                accent: '#00D9FF',
                success: '#22C55E',
                danger: '#EF4444',
                warning: '#F59E0B',
                'text-primary': '#F1F5F9',
                'text-muted': '#64748B',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
            borderRadius: {
                card: '12px',
                btn: '8px',
            },
            boxShadow: {
                glow: '0 0 20px rgba(108, 99, 255, 0.3)',
                'glow-accent': '0 0 20px rgba(0, 217, 255, 0.3)',
                'glow-success': '0 0 15px rgba(34, 197, 94, 0.3)',
                'glow-danger': '0 0 15px rgba(239, 68, 68, 0.3)',
                card: '0 4px 24px rgba(0,0,0,0.4)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #6C63FF 0%, #00D9FF 100%)',
                'gradient-surface': 'linear-gradient(135deg, #1A1D27 0%, #0F1117 100%)',
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
