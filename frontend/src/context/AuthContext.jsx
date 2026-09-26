import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("sts_user") || "null");
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(localStorage.getItem("sts_token"));

  const persist = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem("sts_token", nextToken);
      localStorage.setItem("sts_user", JSON.stringify(nextUser));
      localStorage.setItem("sts_role", nextUser.role);
    } else {
      localStorage.removeItem("sts_token");
      localStorage.removeItem("sts_user");
      localStorage.removeItem("sts_role");
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    persist(data.user, data.token);
    return data.user;
  };

  const register = async (payload) => {
    await api.post("/api/auth/register", payload);
  };

  const logout = () => {
    persist(null, null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
