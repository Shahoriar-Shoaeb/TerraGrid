import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Warehouse as WarehouseIcon, MapPin,
    Thermometer, Box, AlertTriangle, Search, Filter,
    ArrowLeftRight, Clock
} from 'lucide-react'
import { useState } from 'react'
import { getWarehouseById } from '../api/warehouses'
import Badge from '../components/Badge'
import { SkeletonTable } from '../components/Skeleton'
import { formatNumber, categoryColor } from '../utils/formatters'

export default function WarehouseDetail() {
    const { id } = useParams()
    const [search, setSearch] = useState('')
    const [filterLowStock, setFilterLowStock] = useState(false)

    const { data: warehouse, isLoading } = useQuery({
        queryKey: ['warehouse', id],
        queryFn: () => getWarehouseById(id).then(res => res.data)
    })

    const stockLevels = warehouse?.stockLevels?.filter(sl => {
        const matchesSearch = sl.item.name.toLowerCase().includes(search.toLowerCase()) ||
            sl.item.sku.toLowerCase().includes(search.toLowerCase())
        const matchesLowStock = filterLowStock ? sl.quantity <= 100 : true
        return matchesSearch && matchesLowStock
    })

    if (isLoading) return <div className="p-6"><SkeletonTable rows={10} cols={4} /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/warehouses" className="p-2 hover:bg-surface border border-transparent hover:border-border rounded-btn transition-all text-text-muted hover:text-text-primary">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-text-primary">{warehouse.name}</h1>
                        <Badge variant={warehouse.type === 'COLD_STORAGE' ? 'accent' : 'default'} className="uppercase text-[10px]">
                            {warehouse.type.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>{warehouse.location}</span>
                        </div>
                        {warehouse.type === 'COLD_STORAGE' && (
                            <div className="flex items-center gap-1.5">
                                <Thermometer size={14} className="text-danger" />
                                <span>Range: {warehouse.minTemp}° – {warehouse.maxTemp}°C</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card">
                    <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Total Stock</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Box size={20} />
                        </div>
                        <span className="text-3xl font-black text-text-primary">{formatNumber(warehouse.totalStock)}</span>
                    </div>
                </div>
                <div className="glass-card">
                    <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Unique SKUs</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                            <WarehouseIcon size={20} />
                        </div>
                        <span className="text-3xl font-black text-text-primary">{warehouse.stockLevels?.length || 0}</span>
                    </div>
                </div>
                <div className="glass-card">
                    <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Low Stock Items</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-warning/10 text-warning">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-3xl font-black text-text-primary">
                            {warehouse.stockLevels?.filter(sl => sl.quantity <= 100).length || 0}
                        </span>
                    </div>
                </div>
            </div>

            <div className="glass-card !p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Filter stock by SKU or Name..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setFilterLowStock(!filterLowStock)}
                    className={`btn-secondary ${filterLowStock ? 'bg-warning/10 border-warning/30 text-warning' : ''}`}
                >
                    <AlertTriangle size={18} />
                    {filterLowStock ? 'Showing Low Stock' : 'Filter Low Stock'}
                </button>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-bg/50 border-b border-border text-text-muted uppercase text-[11px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Item Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4">Available / Reserved</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stockLevels?.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted">No stock matching filters</td>
                                </tr>
                            ) : (
                                stockLevels?.map((sl) => (
                                    <tr key={sl.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-text-primary font-bold">{sl.item.name}</div>
                                                <div className="text-text-muted font-mono text-xs">{sl.item.sku}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`border uppercase text-[10px] ${categoryColor[sl.item.category] || categoryColor.Diagnostics}`}>
                                                {sl.item.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-black ${sl.quantity <= 100 ? 'text-warning' : 'text-text-primary'}`}>
                                                    {formatNumber(sl.quantity)}
                                                </span>
                                                {sl.quantity <= 100 && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs">
                                                <span className="text-success font-medium">Available: {formatNumber(sl.quantity - sl.reservedQty)}</span>
                                                <span className="text-text-muted italic">Reserved: {formatNumber(sl.reservedQty)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to="/stock" className="btn-secondary !px-3 !py-1.5 text-xs inline-flex text-primary">
                                                <ArrowLeftRight size={14} className="mr-1" />
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
