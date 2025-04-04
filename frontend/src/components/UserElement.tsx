import React from "react";
import "../styles/UserPanel.css"; // Import the CSS file
import { UserType } from "../types";
import { stringToColor, getInitials } from "../utils/imageDisplay";

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
  // Random background color for initials
  const backgroundColor = stringToColor(user.firstName);

  return (
    <div
      key={user.id}
      onClick={onClick}
      className={`user-row ${isSelected ? "selected" : ""}`}
    >
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="profile-picture"
        />
      ) : (
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "12px",
            color: "#fff",
          }}
        >
          {getInitials(user.firstName, user.lastName)}
        </div>
      )}
      <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
    </div>
  );
};

export default UserElement;
