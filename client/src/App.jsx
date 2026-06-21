import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InventoryItems from './pages/InventoryItems'
import Warehouses from './pages/Warehouses'
import WarehouseDetail from './pages/WarehouseDetail'
import StockOperations from './pages/StockOperations'
import TransferHistory from './pages/TransferHistory'
import AuditLogs from './pages/AuditLogs'
import UserManagement from './pages/UserManagement'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isAdmin } = useAuth()
    if (!user) return <Navigate to="/login" replace />
    if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
    return children
}

export default function App() {
    return (
        <Router>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<InventoryItems />} />
                        <Route path="/warehouses" element={<Warehouses />} />
                        <Route path="/warehouses/:id" element={<WarehouseDetail />} />
                        <Route path="/stock" element={<StockOperations />} />
                        <Route path="/history" element={<TransferHistory />} />

                        {/* Admin Only Routes */}
                        <Route
                            path="/audit"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AuditLogs />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute adminOnly>
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AnimatePresence>
        </Router>
    )
}
