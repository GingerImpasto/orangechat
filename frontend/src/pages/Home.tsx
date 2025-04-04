import "../home.css";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import UserPanel from "../components/UserPanel";
import React, { useState, useEffect } from "react";
import MessageFeed from "../components/MessageFeed";

import { UserType, MessageType } from "../types";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]); // Use the Message type
  const [messagesLoading, setMessagesLoading] = useState(false);
  //const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const email = user?.email;

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const logoutUser = async () => {
    logout();
    navigate("/login");
  };
  const fetchUsers = async () => {
    setUsersLoading(true);
    setError("");

    try {
      // Call the /getOtherUsers endpoint
      const response = await fetch(`/home/getOtherUsers?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
      setSelectedUser(data[0]);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [email]);

  // Fetch messages when a user is selected
  useEffect(() => {
    setMessagesLoading(true);

    if (selectedUser && user) {
      const basePath = "/home/getMessagesBetweenUsers";
      const params = new URLSearchParams({
        loggedInUserId: `${user.id}`,
        selectedUserId: `${selectedUser.id}`, // Note: Values must be strings
      });

      const relativeUrl = `${basePath}?${params.toString()}`;

      fetch(relativeUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          return response.json();
        })
        .then((data) => setMessages(data))
        .catch((error) => console.error("Error fetching messages:", error))
        .finally(() => setMessagesLoading(false));
    }
  }, [selectedUser, user]);

  // Function to send a new message
  const handleSendMessage = async (formData: FormData) => {
    if (!selectedUser) return;

    const content = formData.get("content") as string;

    let imageUrl: string | null = null;

    const newMessage = {
      senderId: user ? user.id : "",
      receiverId: selectedUser.id,
      content: content,
      imageUrl: imageUrl,
    };

    // Optimistically update the UI
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        ...newMessage,
        id: "temp-id",
        createdAt: new Date().toISOString(),
        isRead: false,
        imageUrl: null,
      }, // Add a temporary ID and timestamp
    ]);

    try {
      // Send the new message to the backend
      const response = await fetch(`/home/sendMessage`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Replace the optimistic message with the actual message from the backend
      const sentMessage = await response.json();
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === "temp-id" ? sentMessage.data : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);

      // Rollback the optimistic update if the request fails
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== "temp-id")
      );
    }
  };

  return (
    <>
      <div className="home-page">
        <UserPanel
          loggedUser={user}
          users={users}
          onLogout={logoutUser}
          onUserClick={handleUserClick}
          selectedUser={selectedUser}
          usersLoading={usersLoading}
        />
        <MessageFeed
          messages={messages}
          selectedUser={selectedUser}
          onSendMessage={handleSendMessage}
          isLoading={messagesLoading}
        />
      </div>
    </>
  );
};

export default Home;
