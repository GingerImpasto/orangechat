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

  if (!selectedUser) {
    return <div className="messages-container">No user selected.</div>;
  }

  return (
    <div className="message-feed">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.senderId === user?.id ? "sent" : "received"
            }`}
          >
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Sent"
                style={{ maxWidth: "200px", borderRadius: "8px" }}
              />
            )}
            {message.content}
            {message.createdAt}
          </div>
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
