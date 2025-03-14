import "../home.css";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import UserPanel from "../components/user-panel";
import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import MessageFeed from "../components/message-feed";

import { UserType, MessageType } from "../types";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isLoading } = useAuth();

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]); // Use the Message type
  const [messagesLoading, setMessagesLoading] = useState(false);

  const email = user?.email;

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const logoutUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/home/logout", {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Logout failed:", result.error);
      } else {
        // Redirect to the login page after successful logout
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setError("");

      try {
        // Call the /getOtherUsers endpoint
        const response = await fetch(
          `http://localhost:5000/home/getOtherUsers?email=${email}`
        );
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

    fetchUsers();
  }, [email]);

  // Fetch messages when a user is selected
  useEffect(() => {
    setMessagesLoading(true);

    if (selectedUser && user) {
      const url = new URL("http://localhost:5000/home/getMessagesBetweenUsers");
      url.searchParams.append("loggedInUserId", user.id);
      url.searchParams.append("selectedUserId", selectedUser.id);

      fetch(url)
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
  const handleSendMessage = async (content: string) => {
    if (!selectedUser) return;

    const newMessage = {
      senderId: user ? user.id : "",
      receiverId: selectedUser.id,
      content: content,
    };

    // Optimistically update the UI
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        ...newMessage,
        id: "temp-id",
        createdAt: new Date().toISOString(),
        isRead: false,
      }, // Add a temporary ID and timestamp
    ]);

    try {
      // Send the new message to the backend
      const response = await fetch("http://localhost:5000/home/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
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

  if (usersLoading || isLoading || messagesLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="home-page">
        <UserPanel
          users={users}
          onLogout={logoutUser}
          onUserClick={handleUserClick}
          selectedUser={selectedUser}
        />
        <MessageFeed
          messages={messages}
          selectedUser={selectedUser}
          onSendMessage={handleSendMessage}
        />
      </div>
    </>
  );
};

export default Home;
