import React, { useState } from "react";
import { UserType, MessageType } from "../types"; // Assuming you have a types file
import { useAuth } from "../context/AuthContext";
import "../MessageFeed.css";

interface MessageFeedProps {
  messages: MessageType[];
  selectedUser: UserType | null;
  onSendMessage: (text: string) => void; // Callback to handle sending messages
}

const MessageFeed: React.FC<MessageFeedProps> = ({
  messages,
  selectedUser,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState<string>(""); // State for the new message input
  const { user } = useAuth();

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage); // Trigger the callback to send the message
      setNewMessage(""); // Clear the input field
    }
  };

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
            {message.content}
            {message.createdAt}
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <input
          type="text"
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageFeed;
