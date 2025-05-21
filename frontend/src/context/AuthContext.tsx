// AuthContext.tsx
import { UserType, AuthContextType } from "../types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || null
  );
  const [user, setUser] = useState<UserType | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const validateToken = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch("/login/validate-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setToken(storedToken);
        setLoading(false);
        return true;
      }

      logout();
      return false;
    } catch (error) {
      console.error("Token validation failed:", error);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Initialize auth state on mount
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = useCallback((newToken: string, newUser: UserType) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 3. Export the context itself if needed elsewhere
export default AuthContext;
