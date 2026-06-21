import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../utils/formatters';

function AnimatedCount({ value, duration = 1000 }) {
    const [display, setDisplay] = useState(0);
    const start = useRef(null);
    const from = useRef(0);

    useEffect(() => {
        from.current = 0;
        start.current = null;
        const target = Number(value) || 0;
        const step = (ts) => {
            if (!start.current) start.current = ts;
            const progress = Math.min((ts - start.current) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from.current + (target - from.current) * ease));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [value, duration]);

    return <span>{formatNumber(display)}</span>;
}

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, color = 'primary', loading }) {
    const colors = {
        primary: { icon: 'text-primary', glow: 'shadow-glow', border: 'hover:border-primary/40', bg: 'bg-primary/10' },
        accent: { icon: 'text-accent', glow: 'shadow-glow-accent', border: 'hover:border-accent/40', bg: 'bg-accent/10' },
        success: { icon: 'text-success', glow: 'shadow-glow-success', border: 'hover:border-success/40', bg: 'bg-success/10' },
        danger: { icon: 'text-danger', glow: 'shadow-glow-danger', border: 'hover:border-danger/40', bg: 'bg-danger/10' },
        warning: { icon: 'text-warning', glow: '', border: 'hover:border-warning/40', bg: 'bg-warning/10' },
    };
    const c = colors[color] || colors.primary;

    if (loading) {
        return (
            <div className="glass-card animate-pulse">
                <div className="h-4 w-24 bg-border rounded mb-4" />
                <div className="h-8 w-16 bg-border rounded mb-2" />
                <div className="h-3 w-32 bg-border rounded" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
            className={`glass-card ${c.border} cursor-default group`}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-text-muted text-sm font-medium">{label}</p>
                {Icon && (
                    <div className={`w-10 h-10 rounded-btn ${c.bg} flex items-center justify-center ${c.icon} group-hover:${c.glow} transition-shadow`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
            <p className="text-3xl font-black text-text-primary mb-1">
                <AnimatedCount value={value} />
            </p>
            {(trend !== undefined || trendLabel) && (
                <p className="text-xs text-text-muted">{trendLabel || ''}</p>
            )}
        </motion.div>
    );
}
