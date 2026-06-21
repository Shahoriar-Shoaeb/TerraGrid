export default function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'text-text-muted bg-border/50 border-border',
        primary: 'text-primary bg-primary/10 border-primary/30',
        accent: 'text-accent bg-accent/10 border-accent/30',
        success: 'text-success bg-success/10 border-success/30',
        danger: 'text-danger bg-danger/10 border-danger/30',
        warning: 'text-warning bg-warning/10 border-warning/30',
    };
    return (
        <span className={`badge border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
