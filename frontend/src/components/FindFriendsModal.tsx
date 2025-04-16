import React from "react";
import UserSearch from "./UserSearch";
import { UserType } from "../types";
import "../styles/FindFriendsModal.css";

interface FindFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchResults: (UserType & { friendshipStatus?: string })[];
  onAddFriend: (userId: string) => void;
  searchQuery: string;
}

const FindFriendsModal: React.FC<FindFriendsModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  searchResults,
  onAddFriend,
  searchQuery,
}) => {
  if (!isOpen) return null;

  const getButtonState = (status?: string) => {
    switch (status) {
      case "accepted":
        return {
          text: "Friends",
          className: "friend-button friends",
          disabled: true,
          icon: "✓",
        };
      case "pending":
        return {
          text: "Pending",
          className: "friend-button pending",
          disabled: true,
          icon: "⏳",
        };
      case "rejected":
        return {
          text: "Rejected",
          className: "friend-button rejected",
          disabled: true,
          icon: "✗",
        };
      default:
        return {
          text: "Add Friend",
          className: "friend-button send-request",
          disabled: false,
          icon: "+",
        };
    }
  };

  return (
    <div className="modal-overlay">
      <div className="find-friends-modal">
        <div className="modal-header">
          <h2>Find Friends</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <UserSearch
            onSearch={onSearch}
            initialQuery={searchQuery}
            placeholder="Search by name or email..."
          />

          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((user) => {
                const buttonState = getButtonState(user.friendshipStatus);
                return (
                  <div key={user.id} className="user-result">
                    <div className="user-info">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                      )}
                      <div className="user-details">
                        <span className="user-name">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                    <button
                      className={buttonState.className}
                      onClick={() =>
                        !buttonState.disabled && onAddFriend(user.id)
                      }
                      disabled={buttonState.disabled}
                    >
                      <span className="button-icon">{buttonState.icon}</span>
                      <span className="button-text">{buttonState.text}</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                {searchQuery
                  ? "No users found matching your search"
                  : "Start typing to search for friends"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindFriendsModal;
