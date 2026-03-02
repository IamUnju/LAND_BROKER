import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../infrastructure/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from persisted token on app start
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      logout();
    }
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    const { data: userData } = await api.get("/auth/me");
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    await api.post("/auth/register", payload);
  }, []);

  const googleAuth = useCallback(async (accessToken) => {
    const { data } = await api.post("/auth/google", { token: accessToken });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    const { data: userData } = await api.get("/auth/me");
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  const hasRole = (roleName) => user?.role_name === roleName;
  const isAdmin = () => hasRole("ADMIN");
  const isOwner = () => hasRole("OWNER");
  const isTenant = () => hasRole("TENANT");
  const isBroker = () => hasRole("BROKER");

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleAuth, logout, hasRole, isAdmin, isOwner, isTenant, isBroker }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
