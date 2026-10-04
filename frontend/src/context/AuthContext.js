import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'propnest-token';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    const persistToken = (t) => {
        setToken(t);
        try {
            if (t) localStorage.setItem(TOKEN_KEY, t);
            else localStorage.removeItem(TOKEN_KEY);
        } catch {
            /* ignore */
        }
    };

    const loadMe = useCallback(async() => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.data.user);
        } catch {
            persistToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) loadMe();
        else setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async(email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        persistToken(data.data.token);
        setUser(data.data.user);
        return data.data.user;
    };

    const register = async(payload) => {
        const { data } = await api.post('/auth/register', payload);
        persistToken(data.data.token);
        setUser(data.data.user);
        return data.data.user;
    };

    const logout = () => {
        persistToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            refreshUser: loadMe,
        }), [user, token, loading, loadMe]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};