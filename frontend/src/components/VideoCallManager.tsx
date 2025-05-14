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
    caller: UserType;
    offer: RTCSessionDescriptionInit;
  } | null>(null);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isUserCaller, setIsUserCaller] = useState(false);

  const { subscribeToCallOffer, unsubscribeFromCallEvents } = useSocket();

  useEffect(() => {
    const handleCallOffer = (data: {
      caller: UserType;
      offer: RTCSessionDescriptionInit;
    }) => {
      setCallerInfo(data);
      setIsIncomingCall(true);
      setIsUserCaller(false);
    };

    subscribeToCallOffer(handleCallOffer);

    return () => {
      unsubscribeFromCallEvents();
    };
  }, [subscribeToCallOffer, unsubscribeFromCallEvents]);

  const handleStartCall = async () => {
    if (!selectedUser || !currentUserId) return;
    setIsStartingCall(true);
    setIsUserCaller(true);
    try {
      setInCall(true);
      setIsIncomingCall(false); // Ensure no incoming call state is active
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleEndCall = () => {
    setInCall(false);
    setIsIncomingCall(false); // Reset incoming call state
    setCallerInfo(null); // Clear caller info
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
          otherUserId={
            isUserCaller ? selectedUser.id : callerInfo?.caller.id ?? ""
          }
          onEndCall={handleEndCall}
          isCaller={isUserCaller}
          offer={!isUserCaller ? callerInfo?.offer : undefined}
        />
      )}

      {isIncomingCall && callerInfo && !inCall && (
        <div className="incoming-call-modal">
          <div className="incoming-call-content">
            <h3>Incoming Video Call</h3>
            <p>
              {callerInfo.caller.firstName} {callerInfo.caller.lastName}
            </p>
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
          className="video-call-button"
          onClick={handleStartCall}
          disabled={!isConnected || !selectedUser || isStartingCall}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="#FFF"
              d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default VideoCallManager;
