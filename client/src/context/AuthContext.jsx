import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!getStoredToken()) {
            setLoading(false);
            return;
        }
        api
            .me()
            .then((response) => {
            setUser(response.user);
        })
            .catch(() => {
            clearStoredToken();
            setUser(null);
        })
            .finally(() => setLoading(false));
    }, []);
    async function login(values) {
        const response = await api.login(values);
        setStoredToken(response.token);
        setUser(response.user);
    }
    async function register(values) {
        const response = await api.register(values);
        setStoredToken(response.token);
        setUser(response.user);
    }
    function logout() {
        clearStoredToken();
        setUser(null);
    }
    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout
    }), [loading, user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }
    return context;
}
