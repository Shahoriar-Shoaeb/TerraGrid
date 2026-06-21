import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    Package, Search, Plus, Filter, PlusCircle,
    Thermometer, Clock, ChevronRight, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getItems, createItem, getCategories } from '../api/items'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { SkeletonTable } from '../components/Skeleton'
import { formatShelfLife, categoryColor } from '../utils/formatters'

export default function InventoryItems() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')

    const [newItem, setNewItem] = useState({
        sku: '',
        name: '',
        category: '',
        isTempSensitive: false,
        shelfLifeDays: ''
    })

    const { data: items, isLoading } = useQuery({
        queryKey: ['items', search, category],
        queryFn: () => getItems({ search, category }).then(res => res.data)
    })

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories().then(res => res.data)
    })

    const createMutation = useMutation({
        mutationFn: (data) => createItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['items'])
            queryClient.invalidateQueries(['categories'])
            setIsModalOpen(false)
            toast.success('Inventory item created successfully')
            setNewItem({ sku: '', name: '', category: '', isTempSensitive: false, shelfLifeDays: '' })
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to create item')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        createMutation.mutate({
            ...newItem,
            shelfLifeDays: newItem.shelfLifeDays ? parseInt(newItem.shelfLifeDays) : null
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text-primary">Inventory Items</h1>
                    <p className="text-text-muted text-sm mt-0.5">Manage and track your global inventory specifications</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Add New Item
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card !p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by SKU, Name or Category..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <select
                            className="input-field pl-10 appearance-none bg-surface"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories?.map(c => (
                                <option key={c.category} value={c.category}>{c.category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="glass-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-bg/50 border-b border-border text-text-muted uppercase text-[11px] tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">SKU & Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Storage Info</th>
                                <th className="px-6 py-4">Shelf Life</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center">
                                        <SkeletonTable rows={5} cols={5} />
                                    </td>
                                </tr>
                            ) : items?.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-border/20 flex items-center justify-center text-text-muted">
                                                <Package size={24} />
                                            </div>
                                            <p className="text-text-muted font-medium">No items found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items?.map((item) => (
                                    <tr key={item.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-text-primary font-bold">{item.name}</div>
                                                <div className="text-text-muted font-mono text-xs">{item.sku}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`border uppercase text-[10px] ${categoryColor[item.category] || categoryColor.Diagnostics}`}>
                                                {item.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {item.isTempSensitive && (
                                                    <Badge variant="accent" className="gap-1">
                                                        <Thermometer size={12} />
                                                        CLD
                                                    </Badge>
                                                )}
                                                {!item.isTempSensitive && (
                                                    <Badge className="gap-1">STD</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Clock size={14} />
                                                <span>{formatShelfLife(item.shelfLifeDays)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-text-muted hover:text-primary transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Item Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Inventory Item"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">SKU Code</label>
                            <input
                                type="text"
                                required
                                className="input-field font-mono"
                                placeholder="PROD-123"
                                value={newItem.sku}
                                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Item Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Enter item name"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
                        <input
                            type="text"
                            required
                            list="category-suggestions"
                            className="input-field"
                            placeholder="Select or type category"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        />
                        <datalist id="category-suggestions">
                            {categories?.map(c => <option key={c.category} value={c.category} />)}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Shelf Life (Days)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Optional"
                                value={newItem.shelfLifeDays}
                                onChange={(e) => setNewItem({ ...newItem, shelfLifeDays: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-8">
                            <input
                                type="checkbox"
                                id="isTempSensitive"
                                className="w-5 h-5 rounded border-border bg-bg text-primary focus:ring-primary accent-primary"
                                checked={newItem.isTempSensitive}
                                onChange={(e) => setNewItem({ ...newItem, isTempSensitive: e.target.checked })}
                            />
                            <label htmlFor="isTempSensitive" className="text-sm font-medium text-text-primary cursor-pointer">
                                Cold Storage Required
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={createMutation.isLoading}
                        >
                            {createMutation.isLoading ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
