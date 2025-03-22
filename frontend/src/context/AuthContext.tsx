// AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { UserType, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //const [isLoading, setIsLoading] = useState(true); // Initialize as true
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || null
  );
  const [user, setUser] = useState<UserType | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  const login = (newToken: string, newUser: UserType) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const validateToken = async (): Promise<boolean> => {
    setLoading(true); // Start loading

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false); // Stop loading
      return false;
    }

    try {
      // Send token to backend for validation
      const response = await fetch("/login/validate-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setLoading(false); // Stop loading
        return true;
      } else {
        logout();
        setLoading(false); // Stop loading
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      setLoading(false); // Stop loading
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        token,
        login,
        logout,
        validateToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
