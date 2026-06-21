import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    History, Search, Filter, Download, ArrowUpRight,
    ArrowDownLeft, ArrowLeftRight, Calendar
} from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { getMovements } from '../api/movements'
import Badge from '../components/Badge'
import { SkeletonTable } from '../components/Skeleton'
import { formatDate, movementTypeColor, exportToCSV } from '../utils/formatters'

export default function TransferHistory() {
    const [params, setParams] = useState({
        page: 1,
        limit: 20,
        type: '',
        from: '',
        to: ''
    })

    const { data, isLoading } = useQuery({
        queryKey: ['movements', params],
        queryFn: () => getMovements(params).then(res => res.data)
    })

    const handleExport = () => {
        if (!data?.data) return
        const exportData = data.data.map(mv => ({
            Date: formatDate(mv.timestamp),
            Type: mv.movementType,
            Item: mv.item.name,
            SKU: mv.item.sku,
            Quantity: mv.quantity,
            Warehouse: mv.warehouse?.name || 'N/A',
            From: mv.fromWarehouse?.name || 'N/A',
            To: mv.toWarehouse?.name || 'N/A',
            User: mv.user.name,
            Notes: mv.notes
        }))
        exportToCSV(exportData, 'stock_movements')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text-primary">Transfer History</h1>
                    <p className="text-text-muted text-sm mt-0.5">Comprehensive audit trail of all warehouse movements</p>
                </div>
                <button
                    onClick={handleExport}
                    className="btn-secondary"
                    disabled={!data?.total}
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card !p-4 flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-text-muted uppercase px-1">Movement Type</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <select
                            className="input-field pl-10 appearance-none bg-surface"
                            value={params.type}
                            onChange={(e) => setParams({ ...params, type: e.target.value, page: 1 })}
                        >
                            <option value="">All Types</option>
                            <option value="ADD">Stock Added</option>
                            <option value="REMOVE">Stock Removed</option>
                            <option value="TRANSFER_IN">Transfer In</option>
                            <option value="TRANSFER_OUT">Transfer Out</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5 min-w-[150px]">
                    <label className="text-[10px] font-bold text-text-muted uppercase px-1">From Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="date"
                            className="input-field pl-10 appearance-none bg-surface"
                            value={params.from}
                            onChange={(e) => setParams({ ...params, from: e.target.value, page: 1 })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5 min-w-[150px]">
                    <label className="text-[10px] font-bold text-text-muted uppercase px-1">To Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="date"
                            className="input-field pl-10 appearance-none bg-surface"
                            value={params.to}
                            onChange={(e) => setParams({ ...params, to: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="glass-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-bg/50 border-b border-border text-text-muted uppercase text-[11px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Item (SKU)</th>
                                <th className="px-6 py-4">Warehouse Relation</th>
                                <th className="px-6 py-4 text-right">Qty</th>
                                <th className="px-6 py-4 text-right">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-6">
                                        <SkeletonTable rows={10} cols={6} />
                                    </td>
                                </tr>
                            ) : data?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-text-muted">No history found for the selected filters</td>
                                </tr>
                            ) : (
                                data?.data.map((mv) => (
                                    <tr key={mv.id} className="table-row">
                                        <td className="px-6 py-4 whitespace-nowrap text-text-muted text-xs">
                                            {formatDate(mv.timestamp)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`border uppercase text-[10px] ${movementTypeColor[mv.movementType]}`}>
                                                <span className="flex items-center gap-1">
                                                    {mv.movementType === 'ADD' && <ArrowDownLeft size={10} />}
                                                    {mv.movementType === 'REMOVE' && <ArrowUpRight size={10} />}
                                                    {mv.movementType.includes('TRANSFER') && <ArrowLeftRight size={10} />}
                                                    {mv.movementType.replace('_', ' ')}
                                                </span>
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-text-primary font-bold">{mv.item.name}</div>
                                                <div className="text-text-muted font-mono text-[10px]">{mv.item.sku}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs text-text-muted">
                                                {mv.movementType === 'ADD' || mv.movementType === 'REMOVE' ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                                        {mv.warehouse?.name}
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>{mv.fromWarehouse?.name}</span>
                                                        <ArrowRight size={12} className="text-primary" />
                                                        <span>{mv.toWarehouse?.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-text-primary">
                                            {mv.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-right text-text-muted text-xs">
                                            {mv.user.name}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                {data?.total > params.limit && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                        <span>Showing {data.data.length} of {data.total} entries</span>
                        <div className="flex gap-2">
                            <button
                                disabled={params.page === 1}
                                onClick={() => setParams({ ...params, page: params.page - 1 })}
                                className="px-3 py-1.5 rounded border border-border hover:bg-surface disabled:opacity-30"
                            >
                                Previous
                            </button>
                            <button
                                disabled={params.page * params.limit >= data.total}
                                onClick={() => setParams({ ...params, page: params.page + 1 })}
                                className="px-3 py-1.5 rounded border border-border hover:bg-surface disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
