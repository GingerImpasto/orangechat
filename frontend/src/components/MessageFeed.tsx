import React, { useRef, useEffect } from "react";
import { UserType, MessageType } from "../types";
import { useAuth } from "../context/AuthContext";
import MessageForm from "./MessageForm";
import MessageFeedSkeleton from "./MessageFeedSkeleton";
import { io, Socket } from "socket.io-client";
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
  const socketRef = useRef<Socket | null>(null);
  const token = localStorage.getItem("token");

  // WebSocket connection management
  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      auth: { token },
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
            "X-Custom-Header": "chat-client-v1",
          },
        },
      },
    });

    socketRef.current = newSocket;

    // Socket event handlers
    const handleConnect = () => console.log("WebSocket connected");
    const handleDisconnect = () => console.log("WebSocket disconnected");
    const handleError = (err: Error) => console.error("WebSocket error:", err);
    const handleIncomingMessage = (message: MessageType) => {
      console.log("New message received:", message);
      // Implement state update logic here if needed
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("error", handleError);
    newSocket.on("message", handleIncomingMessage);

    // Cleanup function
    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("error", handleError);
      newSocket.off("message", handleIncomingMessage);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const handleWebSocketTest = () => {
    if (user && socketRef.current?.connected) {
      const testMessage = {
        content: "WebSocket connection test successful 🚀",
        senderId: user.id,
        createdAt: new Date().toISOString(),
      };
      socketRef.current.emit("message", testMessage);
    }
  };

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
        onClick={handleWebSocketTest}
        aria-label="Test WebSocket connection"
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
