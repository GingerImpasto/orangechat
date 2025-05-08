import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import "../styles/VideoCall.css";

interface VideoCallProps {
  otherUserId: string;
  onEndCall: () => void;
  isCaller: boolean;
  offer?: RTCSessionDescriptionInit;
}

const VideoCall: React.FC<VideoCallProps> = ({
  otherUserId,
  onEndCall,
  isCaller,
  offer,
}) => {
  const {
    answerVideoCall,
    sendICECandidate,
    endVideoCall,
    subscribeToCallAnswer,
    subscribeToICECandidate,
    unsubscribeFromCallEvents,
    emitCallOffer,
  } = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<string>(
    isCaller ? "Calling..." : "Incoming call..."
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Create and emit offer (caller side)
  const createAndEmitOffer = useCallback(
    async (pc: RTCPeerConnection) => {
      try {
        setCallStatus("Creating offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Emit the offer through the socket
        if (emitCallOffer) {
          await emitCallOffer({
            calleeId: otherUserId,
            offer: pc.localDescription!,
          });
        }

        setCallStatus("Waiting for answer...");
      } catch (error) {
        console.error("Error creating/emitting offer:", error);
        setCallStatus("Failed to create offer");
        setTimeout(onEndCall, 2000);
      }
    },
    [emitCallOffer, otherUserId, onEndCall]
  );

  // Handle incoming offer (callee side)
  const handleIncomingOffer = useCallback(
    async (pc: RTCPeerConnection) => {
      if (!offer) return;

      try {
        setCallStatus("Processing offer...");
        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer to caller
        answerVideoCall(otherUserId, answer);
        setCallStatus("Call in progress");
      } catch (error) {
        console.error("Error handling offer:", error);
        setCallStatus("Failed to process offer");
        setTimeout(onEndCall, 2000);
      }
    },
    [offer, answerVideoCall, otherUserId, onEndCall]
  );

  // Initialize peer connection and media streams
  const initializeCall = useCallback(async () => {
    try {
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers for production
        ],
      });
      peerConnection.current = pc;

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendICECandidate(event.candidate, otherUserId);
        }
      };

      // Remote stream handler
      pc.ontrack = (event) => {
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        setRemoteStream(remoteStream);
      };

      // Connection state handler
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setCallStatus("Call connected");
        } else if (pc.connectionState === "disconnected") {
          setCallStatus("Call ended");
          setTimeout(onEndCall, 2000);
        }
      };

      // Handle call based on role (caller or callee)
      if (isCaller) {
        await createAndEmitOffer(pc);
      } else {
        await handleIncomingOffer(pc);
      }
    } catch (error) {
      console.error("Error initializing call:", error);
      setCallStatus("Call failed");
      setTimeout(onEndCall, 2000);
    }
  }, [
    isCaller,
    otherUserId,
    onEndCall,
    sendICECandidate,
    createAndEmitOffer,
    handleIncomingOffer,
  ]);

  // Handle incoming ICE candidates
  useEffect(() => {
    const handleICECandidate = async ({
      senderId,
      candidate,
    }: {
      senderId: string;
      candidate: RTCIceCandidate;
    }) => {
      if (senderId === otherUserId && peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    subscribeToICECandidate(handleICECandidate);

    return () => {
      unsubscribeFromCallEvents();
    };
  }, [otherUserId, subscribeToICECandidate, unsubscribeFromCallEvents]);

  // Handle incoming answers (caller side)
  useEffect(() => {
    if (!isCaller) return;

    const handleCallAnswer = async ({
      calleeId,
      answer,
    }: {
      calleeId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      if (calleeId === otherUserId && peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(answer);
          setCallStatus("Call in progress");
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      }
    };

    subscribeToCallAnswer(handleCallAnswer);

    return () => {
      unsubscribeFromCallEvents();
    };
  }, [otherUserId, isCaller, subscribeToCallAnswer, unsubscribeFromCallEvents]);

  // Initialize call when component mounts
  useEffect(() => {
    initializeCall();

    return () => {
      // Clean up
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initializeCall]);

  // Update video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // End call
  const handleEndCall = () => {
    endVideoCall(otherUserId);
    onEndCall();
  };

  return (
    <div className="video-call-container">
      <div className="video-call-status">
        <p>{callStatus}</p>
      </div>

      <div className="video-streams">
        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          {!remoteStream && (
            <div className="remote-video-placeholder">
              <div className="user-avatar">
                {otherUserId.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
        </div>
      </div>

      <div className="call-controls">
        <button
          onClick={toggleMute}
          className={`control-button ${isMuted ? "active" : ""}`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>

        <button
          onClick={handleEndCall}
          className="control-button end-call"
          aria-label="End call"
        >
          📞
        </button>

        <button
          onClick={toggleVideo}
          className={`control-button ${isVideoOff ? "active" : ""}`}
          aria-label={isVideoOff ? "Turn video on" : "Turn video off"}
        >
          {isVideoOff ? "📷" : "📹"}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
