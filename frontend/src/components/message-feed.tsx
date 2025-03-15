import React, { useState } from "react";
import { UserType, MessageType } from "../types"; // Assuming you have a types file
import { useAuth } from "../context/AuthContext";
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
  const [newMessage, setNewMessage] = useState<string>(""); // State for the new message input
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", newMessage);
    formData.append("senderId", user ? user.id : "");
    formData.append("receiverId", selectedUser ? selectedUser.id : "");

    if (image) {
      formData.append("image", image);
    }

    await onSendMessage(formData);
    setNewMessage("");
    setImage(null);
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

      <form className="message-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageFeed;
