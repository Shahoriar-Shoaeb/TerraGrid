import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, Warehouse, ArrowLeftRight,
    History, ClipboardList, Users, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/warehouses', icon: Warehouse, label: 'Warehouses' },
    { to: '/stock', icon: ArrowLeftRight, label: 'Stock Ops' },
    { to: '/history', icon: History, label: 'Transfer History' },
];

const adminItems = [
    { to: '/audit', icon: ClipboardList, label: 'Audit Logs' },
    { to: '/users', icon: Users, label: 'Users' },
];

export default function Sidebar({ isMobileOpen, onClose }) {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <motion.aside
                initial={false}
                className={`fixed top-0 left-0 h-full w-64 bg-surface border-r border-border z-50 flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                            <Zap size={18} className="text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-black text-gradient">TerraGrid</span>
                            <p className="text-[10px] text-text-muted font-medium tracking-widest uppercase">Inventory Platform</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] text-text-muted font-semibold tracking-widest uppercase px-4 mb-2">Navigation</p>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                        >
                            <Icon size={18} />
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <>
                            <p className="text-[10px] text-text-muted font-semibold tracking-widest uppercase px-4 mt-6 mb-2">Admin</p>
                            {adminItems.map(({ to, icon: Icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={onClose}
                                    className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{label}</span>
                                </NavLink>
                            ))}
                        </>
                    )}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-btn bg-slate-50">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
                            <p className="text-xs text-text-muted truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-item w-full text-danger hover:text-danger hover:bg-danger/10"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
