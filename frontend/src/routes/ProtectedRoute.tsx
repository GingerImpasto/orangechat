// ProtectedRoute.tsx
import React from "react";
import { Outlet, useNavigate } from "react-router";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    console.log("Loading...");
    return <Loader />;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;
