import React, { useRef, useEffect } from "react";
import { UserType, MessageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageForm from "./MessageForm";
import MessageFeedSkeleton from "./MessageFeedSkeleton";
import "../MessageFeed.css";

interface MessageFeedProps {
  isLoading: boolean;
  messages: MessageType[];
  selectedUser: UserType | null;
  onSendMessage: (formData: FormData) => Promise<void>;
  isFirstTimeUser: boolean;
  onFindFriendsClick: () => void;
}

const MessageFeed: React.FC<MessageFeedProps> = ({
  isLoading,
  messages,
  selectedUser,
  onSendMessage,
  isFirstTimeUser,
  onFindFriendsClick,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, testConnection } = useSocket(); // Use the socket context

  // Handle incoming messages if needed
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message: MessageType) => {
      console.log("New message received:", message);
      // Implement state update logic here if needed
    };

    socket.on("message", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
    };
  }, [socket]);

  const formatMessageDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isFirstTimeUser) {
    return (
      <div className="message-feed-top-container empty-state">
        <div className="empty-state-content">
          <h3>Welcome to Orange Chat!</h3>
          <p>
            Start your journey by connecting with friends. Find people you know
            or discover new connections.
          </p>
          <button onClick={onFindFriendsClick} className="find-friends-btn">
            Find Friends
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="message-feed-top-container">
        <MessageFeedSkeleton />
      </div>
    );
  }

  const reversedMessages = [...messages].reverse();

  return (
    <div className="message-feed-top-container">
      <button
        className="websocket-test-btn"
        onClick={testConnection} // Use the testConnection from context
        aria-label="Test WebSocket connection"
        disabled={!isConnected}
      >
        Test WS Connection
      </button>

      <div className="message-feed">
        {reversedMessages.map((message, index) => {
          const currentDate = formatMessageDate(message.createdAt);
          const nextDate = reversedMessages[index + 1]?.createdAt
            ? formatMessageDate(reversedMessages[index + 1].createdAt)
            : "";

          const showDateSeparator = currentDate !== nextDate;

          return (
            <React.Fragment key={message.id}>
              <div
                className={`message-container ${
                  message.senderId === user?.id
                    ? "message-right"
                    : "message-left"
                }`}
              >
                <div
                  className={`message-bubble ${
                    message.senderId === user?.id
                      ? "message-sent"
                      : "message-received"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Message content"
                      className="message-image"
                      loading="lazy"
                    />
                  )}
                  <p className="message-content">{message.content}</p>
                  {message.createdAt && (
                    <span className="message-timestamp">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
              {showDateSeparator && (
                <div className="date-separator">
                  <span>{currentDate}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageForm
        onSendMessage={onSendMessage}
        selectedUser={selectedUser}
        loggedUser={user}
      />
    </div>
  );
};

export default MessageFeed;
