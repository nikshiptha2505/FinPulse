import { createContext, useContext, useState, useCallback } from "react";
import { getToken, getUser, clearAuth } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(getUser);
  const [token, setToken]     = useState(getToken);

  const loggedIn = !!token;

  const onLogin = useCallback((userData, jwt) => {
    setUser(userData);
    setToken(jwt);
  }, []);

  const onLogout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loggedIn, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
