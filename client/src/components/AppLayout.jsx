import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-bg overflow-hidden">
            <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                {/* Mobile topbar */}
                <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-border bg-surface">
                    <button onClick={() => setMobileOpen(true)} className="text-text-muted hover:text-text-primary">
                        <Menu size={22} />
                    </button>
                    <span className="font-black text-gradient text-lg">TerraGrid</span>
                </div>

                <main className="flex-1 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 min-h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
