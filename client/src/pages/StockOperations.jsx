import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Minus, ArrowLeftRight, Package, Warehouse as WarehouseIcon,
    ArrowRight, CheckCircle2, AlertCircle, Box, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getWarehouses, getWarehouseStock } from '../api/warehouses'
import { getItems } from '../api/items'
import { addStock, removeStock, transferStock } from '../api/stock'
import { formatNumber } from '../utils/formatters'

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold text-sm ${active
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
)

export default function StockOperations() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('add')

    // Form States
    const [formData, setFormData] = useState({
        itemId: '',
        warehouseId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: '',
        notes: ''
    })

    // Queries
    const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: () => getWarehouses().then(res => res.data) })
    const { data: items } = useQuery({ queryKey: ['items-lite'], queryFn: () => getItems().then(res => res.data) })

    const sourceWhId = activeTab === 'transfer' ? formData.fromWarehouseId : formData.warehouseId
    const { data: sourceStock, isLoading: isLoadingStock } = useQuery({
        queryKey: ['warehouse-stock', sourceWhId],
        queryFn: () => getWarehouseStock(sourceWhId).then(res => res.data),
        enabled: !!sourceWhId
    })

    // Computed data
    const selectedItemStock = useMemo(() => {
        if (!sourceStock || !formData.itemId) return null
        return sourceStock.find(sl => sl.itemId === parseInt(formData.itemId))
    }, [sourceStock, formData.itemId])

    const selectedItemFull = useMemo(() => {
        if (!items || !formData.itemId) return null
        return items.find(i => i.id === parseInt(formData.itemId))
    }, [items, formData.itemId])

    const mutation = useMutation({
        mutationFn: (data) => {
            if (activeTab === 'add') return addStock(data)
            if (activeTab === 'remove') return removeStock(data)
            return transferStock(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['warehouse-stock'])
            queryClient.invalidateQueries(['dashboard'])
            queryClient.invalidateQueries(['warehouse'])
            toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} operation successful`)
            setFormData({ itemId: '', warehouseId: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', notes: '' })
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Operation failed')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const payload = {
            itemId: parseInt(formData.itemId),
            quantity: parseInt(formData.quantity),
            notes: formData.notes
        }

        if (activeTab === 'transfer') {
            payload.fromWarehouseId = parseInt(formData.fromWarehouseId)
            payload.toWarehouseId = parseInt(formData.toWarehouseId)
        } else {
            payload.warehouseId = parseInt(formData.warehouseId)
        }

        mutation.mutate(payload)
    }

    const isColdStorageConstraintMet = useMemo(() => {
        if (activeTab !== 'transfer' || !selectedItemFull?.isTempSensitive || !formData.toWarehouseId) return true
        const destWh = warehouses?.find(w => w.id === parseInt(formData.toWarehouseId))
        return destWh?.type === 'COLD_STORAGE'
    }, [activeTab, selectedItemFull, formData.toWarehouseId, warehouses])

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-text-primary">Stock Operations</h1>
                <p className="text-text-muted text-sm mt-0.5">Perform atomic stock adjustments and transfers</p>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <div className="flex border-b border-border bg-bg/30">
                    <TabButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={Plus} label="Add Stock" />
                    <TabButton active={activeTab === 'remove'} onClick={() => setActiveTab('remove')} icon={Minus} label="Remove Stock" />
                    <TabButton active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon={ArrowLeftRight} label="Transfer Stock" />
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Inventory Item</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <select
                                        required
                                        className="input-field pl-10 bg-bg"
                                        value={formData.itemId}
                                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                                    >
                                        <option value="">Select an item...</option>
                                        {items?.map(item => (
                                            <option key={item.id} value={item.id}>{item.sku} - {item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {selectedItemFull?.isTempSensitive && (
                                    <div className="flex items-center gap-2 text-warning text-xs font-bold bg-warning/10 p-2 rounded-btn border border-warning/20">
                                        <AlertCircle size={14} />
                                        TEMP-SENSITIVE: Requires Cold Storage
                                    </div>
                                )}
                            </div>

                            {/* Warehouse Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">
                                    {activeTab === 'transfer' ? 'Source Warehouse' : 'Warehouse'}
                                </label>
                                <div className="relative">
                                    <WarehouseIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <select
                                        required
                                        className="input-field pl-10 bg-bg"
                                        value={activeTab === 'transfer' ? formData.fromWarehouseId : formData.warehouseId}
                                        onChange={(e) => setFormData({ ...formData, [activeTab === 'transfer' ? 'fromWarehouseId' : 'warehouseId']: e.target.value })}
                                    >
                                        <option value="">Select warehouse...</option>
                                        {warehouses?.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.name} ({wh.type})</option>
                                        ))}
                                    </select>
                                </div>
                                {selectedItemStock && (
                                    <div className="text-xs text-text-muted flex items-center justify-between px-2">
                                        <span>Available Stock:</span>
                                        <span className="font-mono font-bold text-text-primary">
                                            {formatNumber(selectedItemStock.quantity - selectedItemStock.reservedQty)} units
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Destination Warehouse (Transfer only) */}
                            {activeTab === 'transfer' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Destination Warehouse</label>
                                    <div className="relative">
                                        <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <select
                                            required
                                            className={`input-field pl-10 bg-bg ${!isColdStorageConstraintMet ? 'border-danger ring-1 ring-danger/20' : ''}`}
                                            value={formData.toWarehouseId}
                                            onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                                        >
                                            <option value="">Select destination...</option>
                                            {warehouses?.filter(wh => wh.id !== parseInt(formData.fromWarehouseId)).map(wh => (
                                                <option key={wh.id} value={wh.id}>{wh.name} ({wh.type})</option>
                                            ))}
                                        </select>
                                    </div>
                                    {!isColdStorageConstraintMet && (
                                        <p className="text-danger text-[10px] font-bold">Error: Dest must be COLD_STORAGE for this item</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Quantity */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Quantity</label>
                                <div className="relative">
                                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="input-field pl-10"
                                        placeholder="Enter units..."
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                {activeTab !== 'add' && selectedItemStock && parseInt(formData.quantity) > (selectedItemStock.quantity - selectedItemStock.reservedQty) && (
                                    <p className="text-danger text-[10px] font-bold">Exceeds available stock!</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Operations Log Note</label>
                            <textarea
                                className="input-field min-h-[80px]"
                                placeholder="Briefly describe the reason for this operation..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        {/* Summary Information */}
                        <AnimatePresence>
                            {formData.itemId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-bg/50 border border-border rounded-btn p-4 flex gap-4"
                                >
                                    <div className="p-2 rounded-lg bg-surface text-text-muted">
                                        <Info size={20} />
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <p className="text-text-primary font-bold">Validation Status</p>
                                        <ul className="text-text-muted space-y-1">
                                            <li className="flex items-center gap-1.5">
                                                <CheckCircle2 size={12} className={formData.itemId ? 'text-success' : 'text-text-muted'} />
                                                Item Selected: {selectedItemFull?.name || 'Pending'}
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <CheckCircle2 size={12} className={formData.quantity > 0 ? 'text-success' : 'text-text-muted'} />
                                                Quantity: {formData.quantity || 0} units
                                            </li>
                                            {activeTab !== 'add' && (
                                                <li className="flex items-center gap-1.5">
                                                    <CheckCircle2 size={12} className={(selectedItemStock && parseInt(formData.quantity) <= (selectedItemStock.quantity - selectedItemStock.reservedQty)) ? 'text-success' : 'text-danger'} />
                                                    Stock Available: {selectedItemStock ? formatNumber(selectedItemStock.quantity - selectedItemStock.reservedQty) : 0} units
                                                </li>
                                            )}
                                            {activeTab === 'transfer' && (
                                                <li className="flex items-center gap-1.5">
                                                    <CheckCircle2 size={12} className={isColdStorageConstraintMet ? 'text-success' : 'text-danger'} />
                                                    Cold Storage Requirement: {selectedItemFull?.isTempSensitive ? 'Required' : 'None'}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={
                                mutation.isLoading ||
                                !isColdStorageConstraintMet ||
                                (activeTab !== 'add' && (!selectedItemStock || parseInt(formData.quantity) > (selectedItemStock.quantity - selectedItemStock.reservedQty)))
                            }
                            className={`w-full py-4 rounded-btn font-black uppercase tracking-widest text-white transition-all shadow-lg ${activeTab === 'add' ? 'bg-success hover:bg-success/90 shadow-success/20' :
                                    activeTab === 'remove' ? 'bg-danger hover:bg-danger/90 shadow-danger/20' :
                                        'bg-primary hover:bg-primary/90 shadow-primary/20'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {mutation.isLoading ? 'Processing Operation...' : `Confirm ${activeTab.toUpperCase()}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
