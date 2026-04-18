import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  api,
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from "@/lib/api";
import type { AppUser } from "@/types/api";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (values: { email: string; password: string }) => Promise<void>;
  register: (values: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((response) => {
        setUser(response.user as AppUser);
      })
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(values: { email: string; password: string }) {
    const response = await api.login(values);
    setStoredToken(response.token);
    setUser(response.user as AppUser);
  }

  async function register(values: {
    name: string;
    email: string;
    password: string;
  }) {
    const response = await api.register(values);
    setStoredToken(response.token);
    setUser(response.user as AppUser);
  }

  function logout() {
    clearStoredToken();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
