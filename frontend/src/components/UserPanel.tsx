import React, { useState, useRef, useEffect } from "react";
import "../styles/UserPanel.css";
import UserElement from "./UserElement";
import ProfileModal from "./ProfileModal";
import UserPanelSkeleton from "./UserPanelSkeleton";
import FindFriendsModal from "./FindFriendsModal";
import { UserType } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { stringToColor, getInitials } from "../utils/imageDisplay";

interface UserPanelProps {
  loggedUser: UserType | null;
  users: UserType[];
  onLogout: () => void;
  onUserClick: (user: UserType) => void;
  selectedUser: UserType | null;
  usersLoading: boolean;
}

const UserPanel: React.FC<UserPanelProps> = ({
  usersLoading,
  users,
  onLogout,
  onUserClick,
  selectedUser,
  loggedUser,
}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Random background color for initials
  const backgroundColor = stringToColor(user ? user.firstName : "");

  const handleProfileClick = () => {
    setProfileModalOpen(true);
    setPopupOpen(false);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleFindFriendsClick = () => {
    setIsFindFriendsOpen(true);
    setPopupOpen(false);
  };

  const handleCloseFindFriends = () => {
    setIsFindFriendsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Replace with your actual API call to search users
      const response = await fetch(
        `/home/searchUsers?query=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFriend = async (userId: string) => {
    // Replace with your actual API call to add friend
    await fetch("/home/addFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId: userId }),
    });
    // Optionally update UI or show success message
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

  if (usersLoading) {
    return (
      <div className="user-panel">
        <UserPanelSkeleton />
      </div>
    );
  }

  return (
    <div className="user-panel">
      {/* User List */}
      <div className="user-list">
        {users.length > 0 ? (
          users.map((user) => (
            <UserElement
              key={user.id}
              user={user}
              onClick={() => onUserClick(user)}
              isSelected={selectedUser?.id === user.id}
            />
          ))
        ) : (
          <div className="no-results">No users available</div>
        )}
      </div>

      {/* Footer with User Profile */}
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
        </span>
      </div>

      {/* Profile Popup */}
      {isPopupOpen && (
        <div className="popup" ref={popupRef}>
          <div className="popup-item" onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="popup-icon" />
            <span>Profile</span>
          </div>
          <div className="popup-item" onClick={handleFindFriendsClick}>
            <FontAwesomeIcon icon={faUserPlus} className="popup-icon" />
            <span>Find Friends</span>
          </div>
          <div className="popup-divider" />
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

      {/* Find Friends Modal */}
      <FindFriendsModal
        isOpen={isFindFriendsOpen}
        onClose={handleCloseFindFriends}
        onSearch={handleSearch}
        searchResults={searchResults}
        onAddFriend={handleAddFriend}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default UserPanel;
