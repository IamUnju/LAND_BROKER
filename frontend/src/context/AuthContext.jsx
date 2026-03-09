import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../infrastructure/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchMeWithRetry = async (attempts = 3) => {
      let lastError;
      for (let i = 0; i < attempts; i += 1) {
        try {
          const { data } = await api.get("/auth/me");
          return data;
        } catch (error) {
          lastError = error;
          const status = error?.response?.status;
          // Authorization failures should not be retried.
          if (status === 401 || status === 403) throw error;
          // Retry transient network/server issues.
          if (i < attempts - 1) {
            await wait(300 * (i + 1));
          }
        }
      }
      throw lastError;
    };

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
      const me = await fetchMeWithRetry();
      setUser(me);
    } catch (error) {
      const status = error?.response?.status;
      // Only clear session for actual auth failures.
      if (status === 401 || status === 403) {
        logout();
      }
    }
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    const userData = await fetchMeWithRetry();
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
    const userData = await fetchMeWithRetry();
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
