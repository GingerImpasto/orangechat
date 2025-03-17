import React, { useState, useRef, useEffect } from "react";
import "../styles/UserPanel.css"; // Import the CSS file
import UserElement from "./user-element";
import ProfileModal from "./ProfileModal";
import { UserType } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { stringToColor, getInitials } from "../utils/imageDisplay";

interface UserPanelProps {
  loggedUser: UserType | null;
  users: UserType[];
  onLogout: () => void;
  onUserClick: (user: UserType) => void;
  selectedUser: UserType | null;
}

const UserPanel: React.FC<UserPanelProps> = ({
  users,
  onLogout,
  onUserClick,
  selectedUser,
  loggedUser,
}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Random background color for initials
  const backgroundColor = stringToColor(user ? user.firstName : "");

  const handleProfileClick = () => {
    setProfileModalOpen(true);
    setPopupOpen(false); // Close the popup when opening the modal
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        footerRef.current &&
        !footerRef.current.contains(event.target as Node)
      ) {
        setPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="user-panel">
      <div className="user-list">
        {users.map((user) => (
          <UserElement
            key={user.id}
            user={user}
            onClick={() => onUserClick(user)}
            isSelected={selectedUser?.id === user.id}
          />
        ))}
      </div>
      <div
        className="user-footer"
        ref={footerRef}
        onClick={() => setPopupOpen(!isPopupOpen)}
      >
        {user?.profileImageUrl ? (
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
            {getInitials(user ? user.firstName : "", user ? user.lastName : "")}
          </div>
        )}
        <span className="username">
          {user?.firstName} {user?.lastName}
        </span>{" "}
      </div>

      {isPopupOpen && (
        <div className="popup" ref={popupRef}>
          <div className="popup-item" onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="popup-icon" />
            <span>Profile</span>
          </div>
          <div className="popup-divider" /> {/* Divider */}
          <div className="popup-item" onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="popup-icon" />
            <span>Logout</span>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          onClose={handleCloseProfileModal}
          loggedUser={loggedUser}
        />
      )}
    </div>
  );
};

export default UserPanel;
