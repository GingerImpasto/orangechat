import React, { useState, useRef, useEffect } from "react";
import "../styles/UserPanel.css"; // Import the CSS file
import UserElement from "./user-element";
import ProfileModal from "./ProfileModal";
import { UserType } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

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
        <img
          src="https://via.placeholder.com/40" // Replace with the actual profile picture URL
          alt="Profile"
          className="profile-picture"
        />
        <span className="username">
          {loggedUser?.firstName} {loggedUser?.lastName}
        </span>{" "}
        {/* Replace with the actual username */}
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
      {isProfileModalOpen && <ProfileModal onClose={handleCloseProfileModal} />}
    </div>
  );
};

export default UserPanel;
