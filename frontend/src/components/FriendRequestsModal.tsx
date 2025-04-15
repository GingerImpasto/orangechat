import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserPlus,
  faUserXmark,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { FriendRequestType } from "../types";
import { stringToColor, getInitials } from "../utils/imageDisplay";
import "../styles/FriendRequestsModal.css";

interface FriendRequestsModalProps {
  isOpen: boolean;
  requests: FriendRequestType[];
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRefresh?: () => void;
}

const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  requests = [],
  onClose,
  onAccept,
  onReject,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const pendingCount = requests.length;

  const handleAccept = (id: string) => {
    onAccept(id);
    onClose();
  };

  const handleReject = (id: string) => {
    onReject(id);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="" />
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-content">
            <h2>Friend Requests</h2>
            {pendingCount > 0 && (
              <span className="request-count">{pendingCount}</span>
            )}
          </div>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          {pendingCount > 0 ? (
            <ul className="requests-list">
              {requests.map((request) => {
                const sender = request.sender || {};
                const firstName = sender.firstName || "Unknown";
                const lastName = sender.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const profileImageUrl = sender.profileImageUrl;

                return (
                  <li key={request.id} className="request-item">
                    <div className="user-info">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={fullName}
                          className="user-avatar"
                        />
                      ) : (
                        <div
                          className="avatar-placeholder"
                          style={{ backgroundColor: stringToColor(firstName) }}
                        >
                          {getInitials(firstName, lastName)}
                        </div>
                      )}
                      <span className="user-name">{fullName}</span>
                    </div>
                    <div className="action-buttons">
                      <button
                        className="accept-button"
                        onClick={() => handleAccept(request.id)}
                        title="Accept"
                      >
                        <FontAwesomeIcon icon={faUserPlus} />
                      </button>
                      <button
                        className="reject-button"
                        onClick={() => handleReject(request.id)}
                        title="Reject"
                      >
                        <FontAwesomeIcon icon={faUserXmark} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No pending friend requests</p>
              {onRefresh && (
                <button className="refresh-button" onClick={onRefresh}>
                  <FontAwesomeIcon icon={faSync} /> Refresh
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsModal;
