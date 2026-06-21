import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Boxes, AlertTriangle, ArrowLeftRight, TrendingUp, Activity } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { getDashboardStats } from '../api/movements';
import { formatDate, movementTypeColor } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface border border-border rounded-btn p-3 text-sm shadow-lg">
            <p className="text-text-muted mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => getDashboardStats().then((r) => r.data),
        refetchInterval: 30000,
    });

    const kpi = data?.kpi || {};

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text-primary">Dashboard</h1>
                    <p className="text-text-muted text-sm mt-0.5">Real-time inventory overview across all warehouses</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted bg-surface border border-border rounded-btn px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
                    Live
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Items" value={kpi.totalItems} icon={Package} color="primary" loading={isLoading} trendLabel="Unique inventory items" />
                <StatCard label="Total Stock Units" value={kpi.totalStock} icon={Boxes} color="accent" loading={isLoading} trendLabel="Across all warehouses" />
                <StatCard label="Low Stock Alerts" value={kpi.lowStockAlerts} icon={AlertTriangle} color="warning" loading={isLoading} trendLabel="Items ≤ 100 units" />
                <StatCard label="Total Transfers" value={kpi.pendingTransfers} icon={ArrowLeftRight} color="success" loading={isLoading} trendLabel="Lifetime transfers" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Warehouse stock bar chart */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-primary" />
                        <h3 className="font-bold text-text-primary">Stock by Warehouse</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data?.warehouseStockData || []} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="totalStock" name="Stock" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Daily movement line chart */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={18} className="text-emerald-500" />
                        <h3 className="font-bold text-text-primary">Stock Movement (Last 7 Days)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data?.dailyMovements || []} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748B' }} />
                            <Line type="monotone" dataKey="added" name="Added" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="removed" name="Removed" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="transferred" name="Transferred" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-accent" />
                    <h3 className="font-bold text-text-primary">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-text-muted">
                                <th className="text-left pb-3 font-medium">Item</th>
                                <th className="text-left pb-3 font-medium hidden sm:table-cell">Warehouse</th>
                                <th className="text-left pb-3 font-medium">Type</th>
                                <th className="text-right pb-3 font-medium">Qty</th>
                                <th className="text-right pb-3 font-medium hidden md:table-cell">By</th>
                                <th className="text-right pb-3 font-medium hidden lg:table-cell">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border/50">
                                        {[1, 2, 3, 4].map(j => <td key={j} className="py-3"><div className="skeleton h-3 w-full" /></td>)}
                                    </tr>
                                ))
                            ) : (data?.recentMovements || []).map((mv) => (
                                <tr key={mv.id} className="table-row">
                                    <td className="py-3 pr-4">
                                        <div>
                                            <p className="font-medium text-text-primary">{mv.item?.name}</p>
                                            <p className="text-xs text-text-muted font-mono">{mv.item?.sku}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 hidden sm:table-cell text-text-muted">{mv.warehouse?.name}</td>
                                    <td className="py-3 pr-4">
                                        <span className={`badge border ${movementTypeColor[mv.movementType]}`}>{mv.movementType}</span>
                                    </td>
                                    <td className="py-3 pr-4 text-right font-mono font-semibold text-text-primary">{mv.quantity}</td>
                                    <td className="py-3 pr-4 text-right hidden md:table-cell text-text-muted text-xs">{mv.user?.name}</td>
                                    <td className="py-3 text-right hidden lg:table-cell text-text-muted text-xs whitespace-nowrap">{formatDate(mv.timestamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
