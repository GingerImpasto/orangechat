// ProtectedRoute.tsx
import React from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

const ProtectedRoute: React.FC = () => {
  const { validateToken, token, loading } = useAuth();
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<
    "checking" | "valid" | "invalid"
  >("checking");

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      setAuthStatus(isValid ? "valid" : "invalid");
      if (!isValid) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [validateToken, navigate, token]);

  if (loading || authStatus === "checking") {
    return <Loader />;
  }

  if (authStatus === "invalid") {
    return null; // Prevents outlet flash while redirecting
  }

  return <Outlet />;
};

export default ProtectedRoute;
