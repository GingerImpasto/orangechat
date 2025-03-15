// MessageForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { UserType } from "../types";
import {
  faSmile,
  faImage,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import "../styles/MessageForm.css";

interface MessageFormProps {
  onSendMessage: (formData: FormData) => Promise<void>; // Callback to handle sending messages
  selectedUser: UserType | null;
  loggedUser: UserType | null;
}

const MessageForm: React.FC<MessageFormProps> = ({
  onSendMessage,
  selectedUser,
  loggedUser,
}) => {
  const [newMessage, setNewMessage] = useState<string>(""); // State for the new message input
  const [image, setImage] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false); // Close the emoji picker
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji); // Append the selected emoji to the message
    setShowEmojiPicker(false); // Close the emoji picker after selection
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", newMessage);
    formData.append("senderId", loggedUser ? loggedUser.id : "");
    formData.append("receiverId", selectedUser ? selectedUser.id : "");

    if (image) {
      formData.append("image", image);
    }

    await onSendMessage(formData);
    setNewMessage("");
    setImage(null);
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}>
      <button
        type="button"
        className="emoji-picker-button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        <FontAwesomeIcon icon={faSmile} />
      </button>
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="emoji-picker-container">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <label htmlFor="file-input" className="image-picker">
        <FontAwesomeIcon icon={faImage} />
      </label>
      <input
        type="file"
        id="file-input"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />
      {image && (
        <div className="image-feedback">
          <img
            src={URL.createObjectURL(image)} // Create a URL for the selected image
            alt="Selected"
            className="image-preview"
          />
          <button onClick={handleRemoveImage} className="remove-image-button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      <input
        type="text"
        id="message-input"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button type="submit" className="send-button">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
};

export default MessageForm;
