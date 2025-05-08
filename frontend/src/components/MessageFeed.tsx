import React, { useRef, useEffect, useState } from "react";
import { UserType, MessageType } from "../types";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageForm from "./MessageForm";
import MessageFeedSkeleton from "./MessageFeedSkeleton";
import VideoCall from "./VideoCall";
import "../MessageFeed.css";

interface MessageFeedProps {
  isLoading: boolean;
  messages: MessageType[];
  selectedUser: UserType | null;
  onSendMessage: (formData: FormData) => Promise<void>;
  isFirstTimeUser: boolean;
  onFindFriendsClick: () => void;
}

const MessageFeed: React.FC<MessageFeedProps> = ({
  isLoading,
  messages,
  selectedUser,
  onSendMessage,
  isFirstTimeUser,
  onFindFriendsClick,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isConnected,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToCallOffer,
    unsubscribeFromCallEvents,
  } = useSocket();

  const [inCall, setInCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{
    callerId: string;
    offer: RTCSessionDescriptionInit;
  } | null>(null);

  // Handle incoming messages
  useEffect(() => {
    const handleNewMessage = (message: MessageType) => {
      // Handle incoming message (add to state, etc.)
      console.log("New message received:", message);
    };

    subscribeToMessages(handleNewMessage);
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  // Handle incoming calls
  useEffect(() => {
    const handleCallOffer = (data: {
      callerId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      if (selectedUser?.id === data.callerId) {
        setCallerInfo(data);
        setIsIncomingCall(true);
      }
    };

    subscribeToCallOffer(handleCallOffer);

    return () => {
      unsubscribeFromCallEvents();
    };
  }, [selectedUser, subscribeToCallOffer, unsubscribeFromCallEvents]);

  const formatMessageDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleStartCall = async () => {
    if (!selectedUser || !user) return;
    setInCall(true); // The VideoCall component will handle offer creation and emission
  };

  const handleEndCall = () => {
    setInCall(false);
  };

  const handleAcceptCall = () => {
    setInCall(true);
    setIsIncomingCall(false);
  };

  const handleRejectCall = () => {
    setIsIncomingCall(false);
    setCallerInfo(null);
    // You might want to emit a call-reject event here
    // Would need to use the rejectVideoCall method from SocketContext
  };

  if (isFirstTimeUser) {
    return (
      <div className="message-feed-top-container empty-state">
        <div className="empty-state-content">
          <h3>Welcome to Orange Chat!</h3>
          <p>
            Start your journey by connecting with friends. Find people you know
            or discover new connections.
          </p>
          <button onClick={onFindFriendsClick} className="find-friends-btn">
            Find Friends
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="message-feed-top-container">
        <MessageFeedSkeleton />
      </div>
    );
  }

  const reversedMessages = [...messages].reverse();

  return (
    <div className="message-feed-top-container">
      {/* Video Call UI */}
      {inCall && selectedUser && (
        <VideoCall
          otherUserId={selectedUser.id}
          onEndCall={handleEndCall}
          isCaller={!isIncomingCall}
          offer={isIncomingCall ? callerInfo?.offer : undefined}
        />
      )}

      {/* Incoming Call Modal */}
      {isIncomingCall && callerInfo && !inCall && (
        <div className="incoming-call-modal">
          <div className="incoming-call-content">
            <h3>Incoming Video Call</h3>
            <p>from {selectedUser?.firstName || "Unknown"}</p>
            <div className="call-buttons">
              <button onClick={handleAcceptCall} className="accept-call-btn">
                Accept
              </button>
              <button onClick={handleRejectCall} className="reject-call-btn">
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Button (only when not in call) */}
      {selectedUser && !inCall && !isIncomingCall && (
        <button
          className="video-call-btn"
          onClick={handleStartCall}
          disabled={!isConnected || !selectedUser}
        >
          Start Video Call
        </button>
      )}

      {/* Messages */}
      <div className="message-feed">
        {reversedMessages.map((message, index) => {
          const currentDate = formatMessageDate(message.createdAt);
          const nextDate = reversedMessages[index + 1]?.createdAt
            ? formatMessageDate(reversedMessages[index + 1].createdAt)
            : "";

          const showDateSeparator = currentDate !== nextDate;

          return (
            <React.Fragment key={message.id}>
              <div
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
                      alt="Message content"
                      className="message-image"
                      loading="lazy"
                    />
                  )}
                  <p className="message-content">{message.content}</p>
                  {message.createdAt && (
                    <span className="message-timestamp">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
              {showDateSeparator && (
                <div className="date-separator">
                  <span>{currentDate}</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageForm
        onSendMessage={onSendMessage}
        selectedUser={selectedUser}
        loggedUser={user}
      />
    </div>
  );
};

export default MessageFeed;
