// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserType, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initialize as true
  console.log("Loader initialized true");
  const [user, setUser] = useState<UserType | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/login/check-auth`, {
          credentials: "include", // Include cookies
        });

        if (response.ok) {
          const result = await response.json();

          console.log("Auth response is ", result);
          setIsAuthenticated(response.ok);
          setUser(result.user);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Set loading to false after the check is complete
      }
    };

    checkAuth();
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, isLoading, login, logout }}
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
