import React, { useEffect, useState } from "react";
import { UserType } from "../types";
import "../styles/MessageHeader.css";
import VideoCallManager from "./VideoCallManager";
import { useSocket } from "../context/SocketContext";

interface MessageHeaderProps {
  selectedUser: UserType | null;
  currentUserId?: string;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  selectedUser,
  currentUserId,
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const { checkPresence, subscribeToPresence, unsubscribeFromPresence } =
    useSocket();

  useEffect(() => {
    if (!selectedUser) return;

    // Check initial presence status
    const checkInitialPresence = async () => {
      try {
        const response = await checkPresence(selectedUser.id);
        setIsOnline(response.isOnline);
      } catch (error) {
        console.error("Failed to check initial presence:", error);
        setIsOnline(false); // Default to offline if check fails
      }
    };

    checkInitialPresence();

    // Subscribe to real-time updates
    const handlePresenceUpdate = (userId: string, isOnline: boolean) => {
      if (selectedUser.id === userId) {
        setIsOnline(isOnline);
      }
    };

    subscribeToPresence(handlePresenceUpdate);

    return () => {
      unsubscribeFromPresence();
    };
  }, [selectedUser?.id]); // Re-run when selected user changes

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
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="message-header-actions">
        <VideoCallManager
          selectedUser={selectedUser}
          isConnected={isOnline}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default MessageHeader;
