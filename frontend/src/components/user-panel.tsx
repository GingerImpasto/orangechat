import React from "react";
import "../home.css"; // Import the CSS file
import UserElement from "./user-element";
import { UserType } from "../types";

interface UserPanelProps {
  users: UserType[];
  onLogout: () => void;
  onUserClick: (user: UserType) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({
  users,
  onLogout,
  onUserClick,
}) => {
  return (
    <div className="user-panel">
      <div className="user-list">
        {users.map((user) => (
          <UserElement
            key={user.id}
            user={user}
            onClick={() => onUserClick(user)}
          />
        ))}
      </div>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserPanel;
