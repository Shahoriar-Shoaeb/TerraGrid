import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    ClipboardList, Search, Filter, ShieldCheck,
    Clock, User as UserIcon, List, Layout
} from 'lucide-react'
import { getAudit } from '../api/movements'
import Badge from '../components/Badge'
import { SkeletonTable } from '../components/Skeleton'
import { formatDate, movementTypeColor } from '../utils/formatters'

export default function AuditLogs() {
    const [viewMode, setViewMode] = useState('table') // 'table' or 'timeline'
    const [params, setParams] = useState({
        page: 1,
        limit: 30,
        userId: '',
        warehouseId: '',
        from: '',
        to: ''
    })

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', params],
        queryFn: () => getAudit(params).then(res => res.data)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-primary">System Audit Logs</h1>
                        <p className="text-text-muted text-sm mt-0.5">Immutable multi-warehouse activity record for compliance</p>
                    </div>
                </div>

                <div className="flex bg-surface border border-border p-1 rounded-btn">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <List size={14} />
                        Table
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'timeline' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <Layout size={14} />
                        Timeline
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="glass-card !p-4 flex flex-wrap gap-4 items-end bg-surface/50 backdrop-blur-md">
                <div className="space-y-1.5 min-w-[200px]">
                    <label className="text-[10px] font-bold text-text-muted uppercase px-1">Filter User ID</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="number"
                            placeholder="User ID..."
                            className="input-field pl-10 h-10"
                            value={params.userId}
                            onChange={(e) => setParams({ ...params, userId: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
                <div className="space-y-1.5 min-w-[150px]">
                    <label className="text-[10px] font-bold text-text-muted uppercase px-1">From Date</label>
                    <input
                        type="date"
                        className="input-field h-10"
                        value={params.from}
                        onChange={(e) => setParams({ ...params, from: e.target.value, page: 1 })}
                    />
                </div>
                <div className="space-y-1.5 min-w-[150px]">
                    <label className="text-[10px] font-bold text-text-muted uppercase px-1">To Date</label>
                    <input
                        type="date"
                        className="input-field h-10"
                        value={params.to}
                        onChange={(e) => setParams({ ...params, to: e.target.value, page: 1 })}
                    />
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="glass-card !p-0 overflow-hidden border-primary/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-primary/5 border-b border-border text-text-muted uppercase text-[10px] tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-4">Event Time</th>
                                    <th className="px-6 py-4">Issuer</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Item (SKU)</th>
                                    <th className="px-6 py-4">Warehouse Context</th>
                                    <th className="px-6 py-4 text-right">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i}><td colSpan="6" className="p-4"><div className="skeleton h-4 w-full" /></td></tr>
                                    ))
                                ) : (data?.data || []).map((log) => (
                                    <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-[10px] text-text-muted">{formatDate(log.timestamp)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {log.user.name[0]}
                                                </div>
                                                <span className="font-medium text-text-primary">{log.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`uppercase text-[9px] ${movementTypeColor[log.movementType]}`}>
                                                {log.movementType.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <p className="text-text-primary font-bold">{log.item.name}</p>
                                                <p className="text-text-muted font-mono">{log.item.sku}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-text-muted">
                                            {log.warehouse?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-black text-text-primary">
                                            {log.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {isLoading ? (
                        <div className="text-center p-12 text-text-muted">Building timeline...</div>
                    ) : (data?.data || []).map((log, idx) => (
                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-bg text-text-primary shadow-glow group-hover:scale-110 transition-transform shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <Clock size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card !p-4 group-hover:border-primary/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-mono text-text-muted">{formatDate(log.timestamp)}</span>
                                    <Badge variant="primary" className="text-[9px]">{log.user.role}</Badge>
                                </div>
                                <p className="text-sm text-text-primary leading-tight">
                                    <span className="font-bold text-primary">{log.user.name}</span> performed <span className={`font-bold ${movementTypeColor[log.movementType].split(' ')[0]}`}>{log.movementType.replace('_', ' ')}</span> of {log.quantity} units of <span className="font-bold">{log.item.name}</span> in {log.warehouse.name}.
                                </p>
                                {log.notes && (
                                    <p className="mt-2 pt-2 border-t border-border text-[11px] text-text-muted italic flex items-center gap-1.5">
                                        <Layout size={10} />
                                        "{log.notes}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
