import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { MessageType } from "../types";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendPrivateMessage: (message: Omit<MessageType, "id">) => void;
  subscribeToMessages: (callback: (message: MessageType) => void) => void;
  unsubscribeFromMessages: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendPrivateMessage: () => {},
  subscribeToMessages: () => {},
  unsubscribeFromMessages: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const messageCallbackRef = useRef<((message: MessageType) => void) | null>(
    null
  );

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

      const handlePrivateMessage = (message: MessageType) => {
        if (messageCallbackRef.current) {
          messageCallbackRef.current(message);
        }
      };

      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("private-message", handlePrivateMessage);
      newSocket.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setIsConnected(false);
      });

      socketRef.current = newSocket;

      return () => {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("private-message", handlePrivateMessage);
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

  const sendPrivateMessage = useCallback((message: Omit<MessageType, "id">) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("private-message", {
        ...message,
        createdAt: new Date().toISOString(),
      });
    } else {
      console.error("Cannot send message - WebSocket not connected");
      throw new Error("WebSocket not connected");
    }
  }, []);

  const subscribeToMessages = useCallback(
    (callback: (message: MessageType) => void) => {
      messageCallbackRef.current = callback;
    },
    []
  );

  const unsubscribeFromMessages = useCallback(() => {
    messageCallbackRef.current = null;
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    sendPrivateMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
