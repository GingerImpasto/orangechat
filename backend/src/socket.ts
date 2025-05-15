import { Server, Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { JwtPayload } from "./auth";
import { fetchUserById, getFriendIds } from "./users";

// Interface for tracking connected users
interface UserSocketMap {
  [userId: string]: string;
}

// Interface for connection status message
interface ConnectionStatus {
  status: string;
  message: string;
}

// Interface for call offer
interface CallOffer {
  callerId: string;
  calleeId: string;
  offer: RTCSessionDescriptionInit;
}

// Interface for call answer
interface CallAnswer {
  callerId: string;
  answer: RTCSessionDescriptionInit;
}

// Interface for ICE candidate exchange
interface IceCandidate {
  candidate: RTCIceCandidate;
  targetUserId: string;
}

interface UserPresence {
  userId: string;
  isOnline: boolean;
}

interface PresenceCheck {
  userId: string;
}

const activeUsers: UserSocketMap = {};

function checkUserPresence(userId: string): UserPresence {
  return {
    userId,
    isOnline: !!activeUsers[userId],
  };
}

// Helper function to notify only friends
function notifyFriendsPresence(
  io: Server,
  userId: string,
  friendIds: string[],
  isOnline: boolean
) {
  const presence: UserPresence = {
    userId,
    isOnline,
  };

  friendIds.forEach((friendId) => {
    const friendSocketId = activeUsers[friendId];
    if (friendSocketId) {
      io.to(friendSocketId).emit("presence-update", presence);
    }
  });
}

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

  // Socket.io middleware for authentication (unchanged)
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
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    const user = await fetchUserById(userId);
    const friendIds = await getFriendIds(userId);

    socket.data.friendIds = friendIds;

    if (!userId) {
      console.log("Unauthorized connection attempt");
      return socket.disconnect();
    }

    // Register user in active connections
    activeUsers[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Only notify this user's friends
    notifyFriendsPresence(io, userId, friendIds, true);

    // Notify user about successful connection
    const connectionStatus: ConnectionStatus = {
      status: "connected",
      message: "WebSocket connection established",
    };
    socket.emit("connection-status", connectionStatus);

    socket.on(
      "check-presence",
      (data: PresenceCheck, callback: (response: UserPresence) => void) => {
        try {
          const { userId } = data;

          if (!userId) {
            throw new Error("User ID is required");
          }

          const response = checkUserPresence(userId);
          callback(response);
        } catch (error) {
          console.error("Presence check error:", error);
          callback({
            userId: data.userId,
            isOnline: false,
          });
        }
      }
    );
    // Handle call initiation (offer)
    socket.on("call-offer", (data: CallOffer) => {
      try {
        const { calleeId, offer } = data;
        if (!calleeId || !offer) {
          return socket.emit("call-error", "Invalid call offer format");
        }

        const calleeSocketId = activeUsers[calleeId];

        if (calleeSocketId) {
          io.to(calleeSocketId).emit("call-offer", {
            caller: user,
            offer,
          });
        } else {
          socket.emit("call-error", "Recipient not available");
        }
      } catch (error) {
        console.error("Call offer error:", error);
        socket.emit("call-error", "Failed to initiate call");
      }
    });

    // Handle call answer
    socket.on("call-answer", (data: CallAnswer) => {
      try {
        const { callerId, answer } = data;

        if (!callerId || !answer) {
          return socket.emit("call-error", "Invalid call answer format");
        }

        const callerSocketId = activeUsers[callerId];

        if (callerSocketId) {
          io.to(callerSocketId).emit("call-answer", {
            calleeId: userId,
            answer,
          });
        } else {
          socket.emit("call-error", "Caller no longer available");
        }
      } catch (error) {
        console.error("Call answer error:", error);
        socket.emit("call-error", "Failed to answer call");
      }
    });

    // Handle ICE candidate exchange
    socket.on("ice-candidate", (data: IceCandidate) => {
      try {
        const { candidate, targetUserId } = data;

        if (!candidate || !targetUserId) {
          return socket.emit("call-error", "Invalid ICE candidate format");
        }

        const targetSocketId = activeUsers[targetUserId];

        if (targetSocketId) {
          io.to(targetSocketId).emit("ice-candidate", {
            senderId: userId,
            candidate,
          });
        }
      } catch (error) {
        console.error("ICE candidate error:", error);
        socket.emit("call-error", "Failed to send ICE candidate");
      }
    });

    // Handle call rejection
    socket.on("call-reject", (callerId: string) => {
      try {
        if (!callerId) return;

        const callerSocketId = activeUsers[callerId];

        if (callerSocketId) {
          io.to(callerSocketId).emit("call-rejected", {
            calleeId: userId,
          });
        }
      } catch (error) {
        console.error("Call rejection error:", error);
      }
    });

    // Handle call end
    socket.on("call-end", (targetUserId: string) => {
      try {
        if (!targetUserId) return;

        const targetSocketId = activeUsers[targetUserId];

        if (targetSocketId) {
          io.to(targetSocketId).emit("call-ended", {
            userId: userId,
          });
        }
      } catch (error) {
        console.error("Call end error:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (activeUsers[userId]) {
        delete activeUsers[userId];
        console.log(`User ${userId} disconnected`);

        // Only notify this user's friends
        notifyFriendsPresence(io, userId, socket.data.friendIds, false);
      }

      // Notify all users that this user is no longer available for calls
      socket.broadcast.emit("user-disconnected", userId);
    });

    // Error handling
    socket.on("error", (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

// Export types for client-side use
export type { CallOffer, CallAnswer, IceCandidate, ConnectionStatus };
