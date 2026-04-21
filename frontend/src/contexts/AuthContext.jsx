import { createContext, useContext, useEffect, useState } from "react";

import { api } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "electromart-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { access: null, refresh: null, user: null };
  });
  const [loading, setLoading] = useState(Boolean(authState.access));

  useEffect(() => {
    if (!authState.access) {
      setLoading(false);
      return;
    }

    let ignore = false;
    api
      .get("/auth/me/", authState.access)
      .then((user) => {
        if (!ignore) {
          const nextState = { ...authState, user };
          setAuthState(nextState);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        }
      })
      .catch(() => {
        if (!ignore) {
          logout();
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const persist = (payload) => {
    setAuthState(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const login = async (credentials) => {
    const payload = await api.post("/auth/login/", credentials);
    persist(payload);
    return payload.user;
  };

  const register = async (values) => {
    const payload = await api.post("/auth/register/", values);
    persist(payload);
    return payload.user;
  };

  const logout = () => {
    const cleared = { access: null, refresh: null, user: null };
    setAuthState(cleared);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshProfile = async () => {
    if (!authState.access) return null;
    const user = await api.get("/auth/me/", authState.access);
    persist({ ...authState, user });
    return user;
  };

  const updateProfile = async (values) => {
    const user = await api.patch("/auth/me/", values, authState.access);
    persist({ ...authState, user });
    return user;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: Boolean(authState.access),
        isAdmin: authState.user?.role === "admin",
        loading,
        login,
        logout,
        register,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
