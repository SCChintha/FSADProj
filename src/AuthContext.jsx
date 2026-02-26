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

  const login = (userData) => {
    if (typeof userData === "string") {
      setRole(userData);
      localStorage.setItem("role", userData);
    } else {
      setUser(userData);
      setRole(userData.role);
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
