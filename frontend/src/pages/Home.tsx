import "../home.css";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import UserPanel from "../components/UserPanel";
import React, { useState, useEffect } from "react";
import MessageFeed from "../components/MessageFeed";
import FindFriendsModal from "../components/FindFriendsModal"; // Add this import

import { UserType, MessageType, FriendRequestType } from "../types";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [friends, setFriends] = useState<UserType[]>([]); // Changed from users to friends
  const [friendsLoading, setFriendsLoading] = useState(false); // Changed from usersLoading
  const [error, setError] = useState("");
  const { user } = useAuth();

  // Add state for FindFriendsModal
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<FriendRequestType[]>(
    []
  );
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Search handler
  // This function will be called when the user types in the search input
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!user?.email) return; // Make sure we have the current user's email

    if (query.trim()) {
      try {
        const response = await fetch(
          `/home/searchUsers?query=${encodeURIComponent(
            query
          )}&currentUserEmail=${encodeURIComponent(user.email)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const results = await response.json();
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Add friend handler
  const handleAddFriend = async (userId: string) => {
    try {
      const response = await fetch("/friends/sendFriendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) throw new Error("Failed to send friend request");

      // Refresh pending requests after adding
      fetchPendingRequests();
      // Optionally show success message
    } catch (error) {
      console.error("Error adding friend:", error);
      // Optionally show error message
    }
  };

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const logoutUser = async () => {
    logout();
    navigate("/login");
  };

  const fetchFriends = async () => {
    if (!user?.id) return;

    setFriendsLoading(true);
    setError("");

    try {
      const response = await fetch(`/friends`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data = await response.json();
      setFriends(data);
      setIsFirstTimeUser(data.length === 0); // Set first-time flag

      // Only auto-select if friends exist
      if (data.length > 0 && !selectedUser) {
        setSelectedUser(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching friends");
      console.error(err);
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user?.id) return;

    setRequestsLoading(true);
    try {
      const response = await fetch(`/friends/pendingRequests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }
      const data = await response.json();
      setPendingRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load pending requests");
      console.error(error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, [user?.id]); // Removed email dependency since we're using token auth

  // Fetch messages when a user is selected
  useEffect(() => {
    setMessagesLoading(true);

    if (selectedUser && user) {
      const basePath = "/home/getMessagesBetweenUsers";
      const params = new URLSearchParams({
        loggedInUserId: `${user.id}`,
        selectedUserId: `${selectedUser.id}`,
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

  const handleSendMessage = async (formData: FormData) => {
    if (!selectedUser) return;

    const content = formData.get("content") as string;

    const newMessage = {
      senderId: user ? user.id : "",
      receiverId: selectedUser.id,
      content: content,
      imageUrl: null,
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
      },
    ]);

    try {
      const response = await fetch(`/home/sendMessage`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const sentMessage = await response.json();
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === "temp-id" ? sentMessage.data : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== "temp-id")
      );
    }
  };

  return (
    <div className="home-page">
      <UserPanel
        loggedUser={user}
        users={friends}
        onLogout={logoutUser}
        onUserClick={handleUserClick}
        selectedUser={selectedUser}
        usersLoading={friendsLoading}
        pendingRequests={pendingRequests}
        requestsLoading={requestsLoading}
        isFirstTimeUser={isFirstTimeUser}
        onFindFriendsClick={() => setIsFindFriendsOpen(true)} // Add this prop
      />
      <MessageFeed
        isLoading={friendsLoading || messagesLoading}
        messages={messages}
        selectedUser={selectedUser}
        onSendMessage={handleSendMessage}
        isFirstTimeUser={isFirstTimeUser}
        onFindFriendsClick={() => setIsFindFriendsOpen(true)}
      />

      <FindFriendsModal
        isOpen={isFindFriendsOpen}
        onClose={() => setIsFindFriendsOpen(false)}
        onSearch={handleSearch}
        searchResults={searchResults}
        onAddFriend={handleAddFriend}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Home;
