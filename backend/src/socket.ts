import { Server, Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { JwtPayload } from "./auth";

// Interface for tracking connected users
interface UserSocketMap {
  [userId: string]: string;
}

// Interface for private message data
interface PrivateMessageData {
  content: string;
  receiverId: string;
  createdAt: string;
}

// Interface for connection status message
interface ConnectionStatus {
  status: string;
  message: string;
}

const activeUsers: UserSocketMap = {};

export const initWebSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? undefined
          : ["http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket.io middleware for authentication
  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: jwt.VerifyErrors | null, decoded: unknown) => {
        if (err) {
          return next(
            new Error(
              err.name === "TokenExpiredError"
                ? "Token expired"
                : "Invalid token"
            )
          );
        }

        // Type guard to ensure decoded is JwtPayload
        const isJwtPayload = (decoded: unknown): decoded is JwtPayload => {
          return (
            typeof decoded === "object" && decoded !== null && "id" in decoded
          );
        };

        if (!isJwtPayload(decoded)) {
          return next(new Error("Invalid token payload"));
        }

        socket.data.userId = decoded.id;
        next();
      }
    );
  });

  // WebSocket connection handler
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    if (!userId) {
      console.log("Unauthorized connection attempt");
      return socket.disconnect();
    }

    // Register user in active connections
    activeUsers[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Notify user about successful connection
    const connectionStatus: ConnectionStatus = {
      status: "connected",
      message: "WebSocket connection established",
    };
    socket.emit("connection-status", connectionStatus);

    // Private message handler
    socket.on("private-message", async (data: PrivateMessageData) => {
      try {
        // Validate message data
        if (!data.content || !data.receiverId) {
          return socket.emit("message-error", "Invalid message format");
        }

        // Construct full message object
        const message = {
          content: data.content,
          senderId: userId,
          receiverId: data.receiverId,
          createdAt: data.createdAt || new Date().toISOString(),
          status: "delivered",
        };

        // Here you would typically save to database
        // await saveMessageToDatabase(message);

        // Find recipient's socket ID
        const recipientSocketId = activeUsers[data.receiverId];

        if (recipientSocketId) {
          // Send to recipient
          io.to(recipientSocketId).emit("private-message", message);
        }

        // Send confirmation to sender
        socket.emit("private-message", message);
      } catch (error) {
        console.error("Message handling error:", error);
        socket.emit("message-error", "Failed to send message");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      delete activeUsers[userId];
      console.log(`User ${userId} disconnected`);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

// Optional: Export type interfaces if needed elsewhere
export type { PrivateMessageData, ConnectionStatus };
