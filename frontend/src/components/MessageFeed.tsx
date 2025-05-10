import React, { useRef, useEffect, useState, useMemo } from "react";
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
  const [isStartingCall, setIsStartingCall] = useState(false); // New state for loading

  // Memoize reversed messages to avoid recalculating on every render
  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  // Handle incoming messages
  useEffect(() => {
    const handleNewMessage = (message: MessageType) => {
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
    setIsStartingCall(true); // Set loading state
    try {
      setInCall(true);
    } finally {
      setIsStartingCall(false);
    }
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
          disabled={!isConnected || !selectedUser || isStartingCall}
          aria-label={
            !isConnected
              ? "Waiting for connection..."
              : !selectedUser
              ? "No user selected"
              : "Start video call"
          }
          data-tooltip={
            !isConnected
              ? "Please wait for connection"
              : !selectedUser
              ? "Select a user to call"
              : undefined
          }
        >
          {isStartingCall ? (
            <span className="call-loading">Starting...</span>
          ) : (
            <>
              <span className="call-icon"></span>
              Start Video Call
            </>
          )}
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
