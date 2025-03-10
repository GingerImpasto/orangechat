import "./App.css";
import { useNavigate } from "react-router";
import { useAuth } from "./context/AuthContext";

function App() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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

  return (
    <>
      <div className="app-page">
        <button className="login-toggle-button" onClick={() => handleLogout()}>
          Log Out
        </button>
        <h2>/ route</h2>
      </div>
    </>
  );
}

export default App;
