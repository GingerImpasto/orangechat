import React from "react";
import "../home.css"; // Import the CSS file

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserElementProps {
  user: User;
}

const UserElement: React.FC<UserElementProps> = ({ user }) => {
  return (
    <div key={user.id} className="user-row">
      <img
        src={undefined}
        alt={`${user.firstName[0]}${user.lastName[0]}`}
        className="profile-picture"
      />
      <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
    </div>
  );
};

export default UserElement;
