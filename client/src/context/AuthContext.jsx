import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('tg_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('tg_token'));

    const login = useCallback(async (credentials) => {
        const res = await loginApi(credentials);
        const { token: t, user: u } = res.data;
        localStorage.setItem('tg_token', t);
        localStorage.setItem('tg_user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(async () => {
        try { await logoutApi(); } catch { }
        localStorage.removeItem('tg_token');
        localStorage.removeItem('tg_user');
        setToken(null);
        setUser(null);
    }, []);

    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'MANAGER' || isAdmin;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isManager }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
