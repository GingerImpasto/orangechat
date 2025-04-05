import React, { useState, useRef, useEffect } from "react";
import "../styles/UserPanel.css";
import UserElement from "./UserElement";
import ProfileModal from "./ProfileModal";
import UserPanelSkeleton from "./UserPanelSkeleton";
import FindFriendsModal from "./FindFriendsModal";
import FriendRequestsModal from "./FriendRequestsModal";
import { UserType, FriendRequestType } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faUserPlus,
  faBell,
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
  pendingRequests?: FriendRequestType[];
  requestsLoading: boolean;
}

const UserPanel: React.FC<UserPanelProps> = ({
  usersLoading,
  users,
  onLogout,
  onUserClick,
  selectedUser,
  loggedUser,
  pendingRequests = [],
  requestsLoading,
}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const backgroundColor = stringToColor(user ? user.firstName : "");

  const handleProfileClick = () => {
    setProfileModalOpen(true);
    setPopupOpen(false);
  };

  const handleFindFriendsClick = () => {
    setIsFindFriendsOpen(true);
    setPopupOpen(false);
  };

  const handleFriendRequestsClick = () => {
    setIsRequestsOpen(true);
    setPopupOpen(false);
  };

  const handleCloseModals = () => {
    setIsFindFriendsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await fetch(
          `/home/searchUsers?query=${encodeURIComponent(query)}`
        );
        const results = await response.json();
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const onAcceptRequest = () => {};
  const onRefreshRequests = () => {};
  const onRejectRequest = () => {};

  const handleAddFriend = async (userId: string) => {
    console.log("Inside handle add friend");
    try {
      const response = await fetch("/friends/sendFriendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or your auth token
        },
        body: JSON.stringify({ receiverId: userId }),
      });
      onRefreshRequests?.();

      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }

      // Handle success (maybe update UI or show notification)
    } catch (error) {
      console.error("Error adding friend:", error);
      // Handle error (show error message to user)
    }
  };

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

  if (usersLoading || requestsLoading) {
    return (
      <div className="user-panel">
        <UserPanelSkeleton />
      </div>
    );
  }

  return (
    <div className="user-panel">
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

      <div className="user-footer" ref={footerRef}>
        <div className="user-info" onClick={() => setPopupOpen(!isPopupOpen)}>
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="profile-picture"
            />
          ) : (
            <div className="initials-avatar" style={{ backgroundColor }}>
              {getInitials(user?.firstName || "", user?.lastName || "")}
            </div>
          )}
          <span className="username">
            {user?.firstName} {user?.lastName}
            {pendingRequests.length > 0 && (
              <span className="friend-request-badge">
                {pendingRequests.length}
              </span>
            )}
          </span>
        </div>
      </div>

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
          {pendingRequests.length > 0 && (
            <div className="popup-item" onClick={handleFriendRequestsClick}>
              <FontAwesomeIcon icon={faBell} className="popup-icon" />
              <span>View Pending Requests ({pendingRequests.length})</span>
            </div>
          )}
          <div className="popup-divider" />
          <div className="popup-item" onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="popup-icon" />
            <span>Logout</span>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        loggedUser={loggedUser}
      />

      <FindFriendsModal
        isOpen={isFindFriendsOpen}
        onClose={handleCloseModals}
        onSearch={handleSearch}
        searchResults={searchResults}
        onAddFriend={handleAddFriend}
        searchQuery={searchQuery}
      />

      <FriendRequestsModal
        isOpen={isRequestsOpen}
        requests={pendingRequests}
        onClose={() => setIsRequestsOpen(false)}
        onAccept={onAcceptRequest || (() => {})}
        onReject={onRejectRequest || (() => {})}
        onRefresh={onRefreshRequests}
      />
    </div>
  );
};

export default UserPanel;
