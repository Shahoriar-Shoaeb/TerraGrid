import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Warehouse as WarehouseIcon, MapPin, Plus,
    ChevronRight, Thermometer, Box, Truck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getWarehouses, createWarehouse } from '../api/warehouses'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { SkeletonCard } from '../components/Skeleton'

export default function Warehouses() {
    const { isAdmin } = useAuth()
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [newWh, setNewWh] = useState({
        name: '',
        location: '',
        type: 'STANDARD',
        minTemp: '',
        maxTemp: ''
    })

    const { data: warehouses, isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => getWarehouses().then(res => res.data)
    })

    const createMutation = useMutation({
        mutationFn: (data) => createWarehouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['warehouses'])
            setIsModalOpen(false)
            toast.success('Warehouse created successfully')
            setNewWh({ name: '', location: '', type: 'STANDARD', minTemp: '', maxTemp: '' })
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to create warehouse')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const payload = {
            ...newWh,
            minTemp: newWh.minTemp ? parseFloat(newWh.minTemp) : null,
            maxTemp: newWh.maxTemp ? parseFloat(newWh.maxTemp) : null
        }
        createMutation.mutate(payload)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text-primary">Warehouses</h1>
                    <p className="text-text-muted text-sm mt-0.5">Monitor and manage your global storage network</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        Add Warehouse
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    warehouses?.map((wh) => (
                        <Link key={wh.id} to={`/warehouses/${wh.id}`}>
                            <motion.div
                                whileHover={{ y: -4 }}
                                className="glass-card h-full flex flex-col group border hover:border-primary/40 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:shadow-glow transition-shadow">
                                        <WarehouseIcon size={24} />
                                    </div>
                                    <Badge variant={wh.type === 'COLD_STORAGE' ? 'accent' : 'default'} className="uppercase text-[10px]">
                                        {wh.type.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{wh.name}</h3>
                                    <div className="flex items-center gap-1.5 text-text-muted text-sm mt-1">
                                        <MapPin size={14} />
                                        <span>{wh.location}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-bg/50 p-3 rounded-btn border border-border/50">
                                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Total Stock</p>
                                            <div className="flex items-center gap-2 text-text-primary">
                                                <Box size={14} className="text-accent" />
                                                <span className="font-mono font-bold">{wh.totalStock?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                        {wh.type === 'COLD_STORAGE' && (
                                            <div className="bg-bg/50 p-3 rounded-btn border border-border/50">
                                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Temp Range</p>
                                                <div className="flex items-center gap-2 text-text-primary">
                                                    <Thermometer size={14} className="text-danger" />
                                                    <span className="font-mono font-bold">{wh.minTemp}° – {wh.maxTemp}°</span>
                                                </div>
                                            </div>
                                        )}
                                        {wh.type !== 'COLD_STORAGE' && (
                                            <div className="bg-bg/50 p-3 rounded-btn border border-border/50">
                                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Throughput</p>
                                                <div className="flex items-center gap-2 text-text-primary">
                                                    <Truck size={14} className="text-success" />
                                                    <span className="font-mono font-bold">{wh.type === 'HIGH_THROUGHPUT' ? 'High' : 'Standard'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-primary font-bold text-sm">
                                    <span>View Stock Details</span>
                                    <ChevronRight size={18} />
                                </div>
                            </motion.div>
                        </Link>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Warehouse"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Warehouse Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Gotham Logistics Center"
                            value={newWh.name}
                            onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Location</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Brooklyn, NY"
                            value={newWh.location}
                            onChange={(e) => setNewWh({ ...newWh, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Warehouse Type</label>
                        <select
                            className="input-field appearance-none bg-surface"
                            value={newWh.type}
                            onChange={(e) => setNewWh({ ...newWh, type: e.target.value })}
                        >
                            <option value="STANDARD">Standard</option>
                            <option value="COLD_STORAGE">Cold Storage</option>
                            <option value="HIGH_THROUGHPUT">High Throughput</option>
                        </select>
                    </div>

                    {newWh.type === 'COLD_STORAGE' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Min Temp (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="input-field"
                                    placeholder="2"
                                    value={newWh.minTemp}
                                    onChange={(e) => setNewWh({ ...newWh, minTemp: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Max Temp (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="input-field"
                                    placeholder="8"
                                    value={newWh.maxTemp}
                                    onChange={(e) => setNewWh({ ...newWh, maxTemp: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

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
                            {createMutation.isLoading ? 'Creating...' : 'Create Warehouse'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
