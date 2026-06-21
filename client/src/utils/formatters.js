export const formatDate = (date) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(date));
};

export const formatNumber = (n) =>
    new Intl.NumberFormat('en-US').format(n ?? 0);

export const formatShelfLife = (days) => {
    if (!days) return '—';
    if (days >= 365) return `${Math.round(days / 365)}y`;
    if (days >= 30) return `${Math.round(days / 30)}mo`;
    return `${days}d`;
};

export const exportToCSV = (data, filename = 'export') => {
    if (!data?.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
        headers.map((h) => {
            const v = row[h];
            const str = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
            return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export const movementTypeColor = {
    ADD: 'text-success bg-success/10 border-success/30',
    REMOVE: 'text-danger bg-danger/10 border-danger/30',
    TRANSFER_IN: 'text-accent bg-accent/10 border-accent/30',
    TRANSFER_OUT: 'text-warning bg-warning/10 border-warning/30',
};

export const categoryColor = {
    'Medical Instruments': 'text-primary bg-primary/10 border-primary/30',
    Vaccines: 'text-accent bg-accent/10 border-accent/30',
    PPE: 'text-success bg-success/10 border-success/30',
    'Lab Reagents': 'text-warning bg-warning/10 border-warning/30',
    Diagnostics: 'text-text-muted bg-border/50 border-border',
    'Infusion Fluids': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    'Blood Products': 'text-red-400 bg-red-400/10 border-red-400/30',
    'Surgical Supplies': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    Pharmaceuticals: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    'Diabetes Care': 'text-pink-400 bg-pink-400/10 border-pink-400/30',
};
