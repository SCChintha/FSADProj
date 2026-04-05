import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem("role");
    return savedRole ? savedRole : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
  });

  const login = (userData) => {
    if (typeof userData === "string") {
      setRole(userData);
      localStorage.setItem("role", userData);
      return;
    }

    const normalizedRole = userData.role?.toLowerCase?.() || userData.role;
    const enrichedUser = {
      ...userData,
      role: normalizedRole,
    };

    setUser(enrichedUser);
    setRole(normalizedRole);
    if (userData.token) {
      setToken(userData.token);
      localStorage.setItem("authToken", userData.token);
    }
    localStorage.setItem("loggedInUser", JSON.stringify(enrichedUser));
    localStorage.setItem("role", normalizedRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
