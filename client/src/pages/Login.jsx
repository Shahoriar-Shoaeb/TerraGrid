import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'ADMIN' ? '/dashboard' : '/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.03) 0%, #FFFFFF 80%)' }}>

            {/* Background grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="flex justify-center mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow"
                            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                            <Zap size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gradient">TerraGrid</h1>
                            <p className="text-xs text-text-muted tracking-widest uppercase">Inventory Platform</p>
                        </div>
                    </div>
                </motion.div>

                {/* Card */}
                <div className="bg-white border border-border rounded-card shadow-xl p-8"
                    style={{ boxShadow: '0 25px 50px rgba(15,23,42,0.1), 0 0 60px rgba(16,185,129,0.03)' }}>
                    <h2 className="text-xl font-bold text-text-primary mb-1">Sign in to your account</h2>
                    <p className="text-sm text-text-muted mb-6">Enter your credentials to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 p-3 rounded-btn bg-danger/10 border border-danger/30 text-danger text-sm"
                            >
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input-field"
                                placeholder="you@terragrid.com"
                                id="login-email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field pr-10"
                                    placeholder="Enter your password"
                                    id="login-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-3 font-bold rounded-btn text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-emerald-500/20"
                            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In →'}
                        </motion.button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6 pt-5 border-t border-border">
                        <p className="text-xs text-text-muted text-center mb-3 font-medium">Quick Demo Credentials</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Admin', email: 'admin@terragrid.com', pass: 'Admin@123' },
                                { label: 'Manager', email: 'manager@terragrid.com', pass: 'Manager@123' },
                            ].map(({ label, email, pass }) => (
                                <button
                                    key={label}
                                    onClick={() => setForm({ email, password: pass })}
                                    className="text-xs p-2 rounded-btn border border-border hover:border-primary/40 text-text-muted hover:text-text-primary transition-all"
                                >
                                    <span className="block font-semibold text-text-primary">{label}</span>
                                    <span className="opacity-60">{email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
