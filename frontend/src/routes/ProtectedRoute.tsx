// ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    console.log("protectedRoute loader");
    return <Loader />; // Show the loader while checking authentication
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
