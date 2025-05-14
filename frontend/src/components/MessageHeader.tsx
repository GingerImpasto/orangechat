import React from "react";
import { UserType } from "../types";
import "../styles/MessageHeader.css";
import VideoCallManager from "./VideoCallManager";

interface MessageHeaderProps {
  selectedUser: UserType | null;
  currentUserId?: string;
  isConnected: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  selectedUser,
  currentUserId,
  isConnected,
}) => {
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
        {/* Video Call Manager handles all call-related UI and logic */}
        <VideoCallManager
          selectedUser={selectedUser}
          isConnected={isConnected}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default MessageHeader;
