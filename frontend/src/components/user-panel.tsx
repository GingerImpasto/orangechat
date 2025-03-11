import React from "react";
import "../home.css"; // Import the CSS file
import UserElement from "./user-element";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserPanelProps {
  users: User[];
  onLogout: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ users, onLogout }) => {
  return (
    <div className="user-panel">
      <div className="user-list">
        {users.map((user) => (
          <UserElement key={user.id} user={user} />
        ))}
      </div>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserPanel;
