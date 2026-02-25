import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({ token }); // Simplified
  }, []);

  const login = (token: string, u: any) => {
    localStorage.setItem("token", token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
