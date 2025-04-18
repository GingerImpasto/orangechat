import React, { useEffect, useRef } from "react"; // Add useRef and useEffect
import { UserType, MessageType } from "../types";
import { useAuth } from "../context/AuthContext";
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
  const messagesEndRef = useRef<HTMLDivElement>(null); // Create a ref for the messages container

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const groupMessagesByDate = (messages: MessageType[]) => {
    const groupedMessages: { [key: string]: MessageType[] } = {};

    messages.forEach((message) => {
      if (!message.createdAt) return;

      const date = new Date(message.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

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

  return (
    <div className="message-feed-top-container">
      <div className="message-feed">
        {Object.entries(groupedMessages).map(([date, messagesForDate]) => (
          <React.Fragment key={date}>
            <div className="date-separator">
              <span>{date}</span>
            </div>

            {messagesForDate.map((message) => (
              <div
                key={message.id}
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
            ))}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} /> {/* This is the anchor for scrolling */}
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
