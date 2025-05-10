// VideoCallManager.tsx
import React, { useState, useEffect } from "react";
import { UserType } from "../types";
import { useSocket } from "../context/SocketContext";
import VideoCall from "./VideoCall";
import "../styles/VideoCallManager.css";

interface VideoCallManagerProps {
  selectedUser: UserType | null;
  isConnected: boolean;
  currentUserId: string | undefined;
}

const VideoCallManager: React.FC<VideoCallManagerProps> = ({
  selectedUser,
  isConnected,
  currentUserId,
}) => {
  const [inCall, setInCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{
    callerId: string;
    offer: RTCSessionDescriptionInit;
  } | null>(null);
  const [isStartingCall, setIsStartingCall] = useState(false);

  const { subscribeToCallOffer, unsubscribeFromCallEvents } = useSocket();

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

  const handleStartCall = async () => {
    if (!selectedUser || !currentUserId) return;
    setIsStartingCall(true);
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

  return (
    <>
      {inCall && selectedUser && (
        <VideoCall
          otherUserId={selectedUser.id}
          onEndCall={handleEndCall}
          isCaller={!isIncomingCall}
          offer={isIncomingCall ? callerInfo?.offer : undefined}
        />
      )}

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
    </>
  );
};

export default VideoCallManager;
