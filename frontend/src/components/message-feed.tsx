import React from "react";
import { UserType, MessageType } from "../types"; // Assuming you have a types file
import { useAuth } from "../context/AuthContext";
import MessageForm from "./MessageForm";
import "../MessageFeed.css";

interface MessageFeedProps {
  messages: MessageType[];
  selectedUser: UserType | null;
  onSendMessage: (formData: FormData) => Promise<void>; // Callback to handle sending messages
}

const MessageFeed: React.FC<MessageFeedProps> = ({
  messages,
  selectedUser,
  onSendMessage,
}) => {
  const { user } = useAuth();

  // Helper function to group messages by date
  const groupMessagesByDate = (messages: MessageType[]) => {
    const groupedMessages: { [key: string]: MessageType[] } = {};

    messages.forEach((message) => {
      if (!message.createdAt) return;

      const date = new Date(message.createdAt).toDateString(); // Get the date string (e.g., "Mon Oct 02 2023")
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (!selectedUser) {
    return <div className="messages-container">No user selected.</div>;
  }

  return (
    <div className="message-feed-top-container">
      <div className="message-feed">
        {Object.entries(groupedMessages).map(([date, messagesForDate]) => (
          <React.Fragment key={date}>
            {/* Date separator */}
            <div className="date-separator">
              <span>{date}</span>
            </div>

            {/* Messages for this date */}
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
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <MessageForm
        onSendMessage={onSendMessage}
        selectedUser={selectedUser}
        loggedUser={user}
      ></MessageForm>
    </div>
  );
};

export default MessageFeed;
