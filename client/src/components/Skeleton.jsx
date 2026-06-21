export function Skeleton({ className = '' }) {
    return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="glass-card">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border border-border rounded-btn">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton key={j} className={`h-4 flex-1`} />
                    ))}
                </div>
            ))}
        </div>
    );
}
