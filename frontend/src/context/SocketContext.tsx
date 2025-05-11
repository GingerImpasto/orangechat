import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { SocketContextType } from "../types/socketTypes";

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emitCallOffer: async () => {},
  answerVideoCall: () => {},
  sendICECandidate: () => {},
  rejectVideoCall: () => {},
  endVideoCall: () => {},
  subscribeToCallOffer: () => {},
  subscribeToCallAnswer: () => {},
  subscribeToICECandidate: () => {},
  subscribeToCallRejection: () => {},
  subscribeToCallEnd: () => {},
  unsubscribeFromCallEvents: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);

  // Refs for callbacks

  const callOfferCallbackRef = useRef<
    | ((data: { callerId: string; offer: RTCSessionDescriptionInit }) => void)
    | null
  >(null);
  const callAnswerCallbackRef = useRef<
    | ((data: { calleeId: string; answer: RTCSessionDescriptionInit }) => void)
    | null
  >(null);
  const iceCandidateCallbackRef = useRef<
    ((data: { senderId: string; candidate: RTCIceCandidate }) => void) | null
  >(null);
  const callRejectionCallbackRef = useRef<
    ((data: { calleeId: string }) => void) | null
  >(null);
  const callEndCallbackRef = useRef<
    ((data: { userId: string }) => void) | null
  >(null);

  // Watch for token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setShouldConnect(!!token);
  }, []);

  // Handle connection logic
  useEffect(() => {
    if (!shouldConnect) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    if (!socketRef.current || socketRef.current.disconnected) {
      const newSocket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
        auth: { token },
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${token}`,
              "X-Custom-Header": "chat-client-v1",
            },
          },
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const handleConnect = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
      };

      // Call event handlers
      const handleCallOffer = (data: {
        callerId: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        callOfferCallbackRef.current?.(data);
      };

      const handleCallAnswer = (data: {
        calleeId: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        callAnswerCallbackRef.current?.(data);
      };

      const handleICECandidate = (data: {
        senderId: string;
        candidate: RTCIceCandidate;
      }) => {
        iceCandidateCallbackRef.current?.(data);
      };

      const handleCallRejection = (data: { calleeId: string }) => {
        callRejectionCallbackRef.current?.(data);
      };

      const handleCallEnd = (data: { userId: string }) => {
        callEndCallbackRef.current?.(data);
      };

      // Event listeners
      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("call-offer", handleCallOffer);
      newSocket.on("call-answer", handleCallAnswer);
      newSocket.on("ice-candidate", handleICECandidate);
      newSocket.on("call-rejected", handleCallRejection);
      newSocket.on("call-ended", handleCallEnd);
      newSocket.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setIsConnected(false);
      });

      socketRef.current = newSocket;

      return () => {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("call-offer", handleCallOffer);
        newSocket.off("call-answer", handleCallAnswer);
        newSocket.off("ice-candidate", handleICECandidate);
        newSocket.off("call-rejected", handleCallRejection);
        newSocket.off("call-ended", handleCallEnd);
        newSocket.off("connect_error");
        if (newSocket.connected) {
          newSocket.disconnect();
        }
      };
    }
  }, [shouldConnect]);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setShouldConnect(!!localStorage.getItem("token"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Video call methods
  const emitCallOffer = useCallback(
    async (data: { calleeId: string; offer: RTCSessionDescriptionInit }) => {
      if (!socketRef.current?.connected) {
        throw new Error("WebSocket not connected");
      }

      return new Promise<void>((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error("Socket not initialized"));
          return;
        }

        socketRef.current.emit(
          "call-offer",
          data,
          (response: { success: boolean }) => {
            if (response?.success) {
              resolve();
            } else {
              reject(new Error("Failed to send offer"));
            }
          }
        );
      });
    },
    []
  );

  const answerVideoCall = useCallback(
    (callerId: string, answer: RTCSessionDescriptionInit) => {
      if (!socketRef.current?.connected) {
        throw new Error("WebSocket not connected");
      }
      socketRef.current.emit("call-answer", { callerId, answer });
    },
    []
  );

  const sendICECandidate = useCallback(
    (candidate: RTCIceCandidate, targetUserId: string) => {
      if (!socketRef.current?.connected) {
        throw new Error("WebSocket not connected");
      }
      socketRef.current.emit("ice-candidate", { candidate, targetUserId });
    },
    []
  );

  const rejectVideoCall = useCallback((callerId: string) => {
    if (!socketRef.current?.connected) {
      throw new Error("WebSocket not connected");
    }
    socketRef.current.emit("call-reject", callerId);
  }, []);

  const endVideoCall = useCallback((targetUserId: string) => {
    if (!socketRef.current?.connected) {
      throw new Error("WebSocket not connected");
    }
    socketRef.current.emit("call-end", targetUserId);
  }, []);

  // Call event subscriptions
  const subscribeToCallOffer = useCallback(
    (
      callback: (data: {
        callerId: string;
        offer: RTCSessionDescriptionInit;
      }) => void
    ) => {
      callOfferCallbackRef.current = callback;
    },
    []
  );

  const subscribeToCallAnswer = useCallback(
    (
      callback: (data: {
        calleeId: string;
        answer: RTCSessionDescriptionInit;
      }) => void
    ) => {
      callAnswerCallbackRef.current = callback;
    },
    []
  );

  const subscribeToICECandidate = useCallback(
    (
      callback: (data: { senderId: string; candidate: RTCIceCandidate }) => void
    ) => {
      iceCandidateCallbackRef.current = callback;
    },
    []
  );

  const subscribeToCallRejection = useCallback(
    (callback: (data: { calleeId: string }) => void) => {
      callRejectionCallbackRef.current = callback;
    },
    []
  );

  const subscribeToCallEnd = useCallback(
    (callback: (data: { userId: string }) => void) => {
      callEndCallbackRef.current = callback;
    },
    []
  );

  const unsubscribeFromCallEvents = useCallback(() => {
    callOfferCallbackRef.current = null;
    callAnswerCallbackRef.current = null;
    iceCandidateCallbackRef.current = null;
    callRejectionCallbackRef.current = null;
    callEndCallbackRef.current = null;
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    // Video call methods
    emitCallOffer,
    answerVideoCall,
    sendICECandidate,
    rejectVideoCall,
    endVideoCall,
    // Call event subscriptions
    subscribeToCallOffer,
    subscribeToCallAnswer,
    subscribeToICECandidate,
    subscribeToCallRejection,
    subscribeToCallEnd,
    unsubscribeFromCallEvents,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
