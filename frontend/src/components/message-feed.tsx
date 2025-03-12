import React, { useState, useEffect } from "react";
import { UserType } from "../types"; // Assuming you have a types file
import "../MessageFeed.css";

interface MessageFeedProps {
  selectedUser: UserType | null;
}

const MessageFeed: React.FC<MessageFeedProps> = ({ selectedUser }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (selectedUser) {
      // Fetch messages for the selected user (mock data)
      setMessages([
        `Hello, ${selectedUser.firstName}! (demo)`,
        `How are you doing, ${selectedUser.firstName}? (demo)`,
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      setMessages([...messages, `You: ${newMessage}`]);
      setNewMessage("");
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
              message.startsWith("You:") ? "sent" : "received"
            }`}
          >
            {message}
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
