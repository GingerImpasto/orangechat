// ProtectedRoute.tsx
import React from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import Loader from "../components/Loader";
const ProtectedRoute: React.FC = () => {
  const { validateToken, token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [validateToken, navigate, token]);

  if (loading) {
    return <Loader />; // Show a loader while validating
  }

  return <Outlet />;
};

export default ProtectedRoute;
