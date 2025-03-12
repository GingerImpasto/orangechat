import React from "react";
import "../home.css"; // Import the CSS file
import { UserType } from "../types";

interface UserElementProps {
  user: UserType;
  onClick: () => void;
  isSelected: boolean;
}

const UserElement: React.FC<UserElementProps> = ({
  user,
  onClick,
  isSelected,
}) => {
  return (
    <div
      key={user.id}
      onClick={onClick}
      className={`user-row ${isSelected ? "selected" : ""}`}
    >
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
