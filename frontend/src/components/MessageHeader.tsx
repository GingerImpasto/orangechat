import React from "react";
import { UserType } from "../types";
import { useSocket } from "../context/SocketContext";
import "../styles/MessageHeader.css";

interface MessageHeaderProps {
  selectedUser: UserType | null;
  onVideoCall?: () => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  selectedUser,
  onVideoCall,
}) => {
  const { isConnected } = useSocket();

  if (!selectedUser) return null;

  return (
    <div className="message-header">
      <div className="message-header-profile">
        {selectedUser.profileImageUrl && (
          <img
            src={selectedUser.profileImageUrl}
            alt={selectedUser.firstName}
            className="message-header-avatar"
          />
        )}
        <div className="message-header-info">
          <h3>
            {selectedUser.firstName} {selectedUser.lastName}
          </h3>
          <p className="message-header-status">
            {isConnected ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="message-header-actions">
        <button className="video-call-button" onClick={onVideoCall}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="#FFF"
              d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageHeader;
