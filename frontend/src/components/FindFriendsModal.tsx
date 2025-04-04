import React from "react";
import UserSearch from "./UserSearch";
import { UserType } from "../types";
import "../styles/FindFriendsModal.css"; // Add this import

interface FindFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchResults: UserType[];
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

  console.log("search results", searchResults);

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
              searchResults.map((user) => (
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
                    <span className="user-names">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <button
                    className="add-friend-button"
                    onClick={() => onAddFriend(user.id)}
                  >
                    Add Friend
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">
                {searchQuery
                  ? "No users found"
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
