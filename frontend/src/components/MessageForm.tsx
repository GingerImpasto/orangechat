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
  onSendMessage: (formData: FormData) => Promise<void>;
  selectedUser: UserType | null;
  loggedUser: UserType | null;
}

const MessageForm: React.FC<MessageFormProps> = ({
  onSendMessage,
  selectedUser,
  loggedUser,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return; // Prevent empty submissions

    const formData = new FormData();
    formData.append("content", newMessage);
    formData.append("senderId", loggedUser?.id || "");
    formData.append("receiverId", selectedUser?.id || "");

    if (image) {
      formData.append("image", image);
    }

    await onSendMessage(formData);
    setNewMessage("");
    setImage(null);
  };

  // Handle Enter key for submission and Shift+Enter for new lines
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line
      handleSubmit(e); // Triggers form submission
    }
    // Shift+Enter will add a new line (default behavior)
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
            src={URL.createObjectURL(image)}
            alt="Selected"
            className="image-preview"
          />
          <button onClick={handleRemoveImage} className="remove-image-button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      <textarea
        id="message-input"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleTextareaKeyDown}
        rows={1}
      />
      <button type="submit" className="send-button">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
};

export default MessageForm;
