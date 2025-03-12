import "../home.css";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import UserPanel from "../components/user-panel";
import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isLoading } = useAuth();
  const email = user?.email;

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/home/logout", {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Logout failed:", result.error);
      } else {
        // Redirect to the login page after successful logout
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setError("");

      try {
        // Call the /getOtherUsers endpoint
        const response = await fetch(
          `http://localhost:5000/home/getOtherUsers?email=${email}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        console.error(error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [email]);

  if (usersLoading || isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="home-page">
        <UserPanel users={users} onLogout={handleLogout} />
      </div>
    </>
  );
};

export default Home;
