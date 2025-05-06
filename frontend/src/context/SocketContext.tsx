import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  testConnection: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  testConnection: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);

  // Watch for token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setShouldConnect(!!token);
  }, []); // Empty dependency array to run only once on mount

  // Handle connection logic
  useEffect(() => {
    if (!shouldConnect) {
      // Clean up if we shouldn't be connected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    // Only create new socket if one doesn't exist or previous one was disconnected
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

      socketRef.current = newSocket;

      const handleConnect = () => {
        setIsConnected(true);
        console.log("WebSocket connected");
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected");
      };

      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("connect_error", (err) => {
        console.error("Connection error:", err);
        setIsConnected(false);
      });

      return () => {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("connect_error");
        if (newSocket.connected) {
          newSocket.disconnect();
        }
      };
    }
  }, [shouldConnect]); // Re-run when shouldConnect changes

  // Listen for storage events (for token changes from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setShouldConnect(!!localStorage.getItem("token"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const testConnection = () => {
    if (socketRef.current?.connected) {
      const testMessage = {
        content: "WebSocket connection test successful 🚀",
        senderId: "system",
        createdAt: new Date().toISOString(),
      };
      socketRef.current.emit("message", testMessage);
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    testConnection,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
