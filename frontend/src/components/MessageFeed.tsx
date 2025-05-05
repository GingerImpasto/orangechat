import React, { useRef } from "react";
import { UserType, MessageType } from "../types";
import { useAuth } from "../context/AuthContext";
import MessageForm from "./MessageForm";
import MessageFeedSkeleton from "./MessageFeedSkeleton";
import io from "socket.io-client";
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

  // Create WebSocket connection
  const socket = useRef(
    io("http://localhost:5000", {
      transports: ["polling"], // or ["websocket", "polling"]
      auth: { token: localStorage.getItem("token") }, // If using authentication tokens
      transportOptions: {
        polling: {
          extraHeaders: {
            "my-custom-header": "header-value",
          },
        },
      },
    })
  ).current;

  // Add WebSocket test handler
  const handleWebSocketTest = () => {
    if (user) {
      const testMessage = {
        content: "Test message via WebSocket",
        senderId: user.id,
        createdAt: new Date().toISOString(),
      };
      socket.emit("message", testMessage);
    }
  };

  const formatMessageDate = (dateString: string | undefined) => {
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

  // Create a reversed copy of the messages array
  const reversedMessages = [...messages].reverse();

  return (
    <div className="message-feed-top-container">
      {/* Add WebSocket test button */}
      <button className="websocket-test-btn" onClick={handleWebSocketTest}>
        Send Test WS Message
      </button>

      <div className="message-feed">
        {reversedMessages.map((message, index) => {
          const currentDate = formatMessageDate(message.createdAt);
          const nextDate =
            index < reversedMessages.length - 1
              ? formatMessageDate(reversedMessages[index + 1].createdAt)
              : "";

          // Show separator if this is the first message of a new date group
          const showDateSeparator = currentDate && currentDate !== nextDate;

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
                      alt="message content"
                      className="message-image"
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
