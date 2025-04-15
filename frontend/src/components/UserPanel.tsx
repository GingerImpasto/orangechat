import React, { useState, useRef, useEffect } from "react";
import "../styles/UserPanel.css";
import UserElement from "./UserElement";
import ProfileModal from "./ProfileModal";
import UserPanelSkeleton from "./UserPanelSkeleton";
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
  isFirstTimeUser?: boolean;
  onFindFriendsClick?: () => void;
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
  isFirstTimeUser,
  onFindFriendsClick,
}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const backgroundColor = stringToColor(user ? user.firstName : "");

  const handleProfileClick = () => {
    setProfileModalOpen(true);
    setPopupOpen(false);
  };

  const handleFriendRequestsClick = () => {
    setIsRequestsOpen(true);
    setPopupOpen(false);
  };

  const onAcceptRequest = async (requestId: string) => {
    console.log("accepting request ...");
    try {
      const response = await fetch("/friends/acceptFriendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      // Refresh the pending requests list
      onRefreshRequests?.();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      // Optionally show an error message to the user
    }
  };

  const onRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch("/friends/rejectFriendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject friend request");
      }

      // Refresh the pending requests list
      onRefreshRequests?.();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      // Optionally show an error message to the user
    }
  };

  const onRefreshRequests = async () => {
    try {
      const response = await fetch("/friends/pendingRequests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      // const updatedRequests = await response.json();
      // Update the pendingRequests state in the parent component (if needed)
      // This assumes the parent component handles the state for pendingRequests
    } catch (error) {
      console.error("Error refreshing requests:", error);
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
      {isFirstTimeUser && (
        <div className="first-time-banner">
          <p>Start by adding friends!</p>
          <button onClick={onFindFriendsClick}>Find Friends</button>
        </div>
      )}

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
          <div
            className="popup-item"
            onClick={() => {
              setPopupOpen(false);
              onFindFriendsClick?.();
            }}
          >
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

      <FriendRequestsModal
        isOpen={isRequestsOpen}
        requests={pendingRequests}
        onClose={() => setIsRequestsOpen(false)}
        onAccept={onAcceptRequest}
        onReject={onRejectRequest}
        onRefresh={onRefreshRequests}
      />
    </div>
  );
};

export default UserPanel;
