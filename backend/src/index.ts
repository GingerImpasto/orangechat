import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import loginRoutes from "./routes/login";
import homeRoutes from "./routes/home";
import friendsRoutes from "./routes/friends";
import cookieParser from "cookie-parser";
import path from "path";
import jwt from "jsonwebtoken";
import { authenticateToken, JwtPayload } from "./auth";

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Interface for tracking connected users
interface UserSocketMap {
  [userId: string]: string;
}

const activeUsers: UserSocketMap = {};

// Configure Socket.io with enhanced settings
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
io.use((socket, next) => {
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
            err.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
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

      socket.data.userId = decoded.id; // Now safely typed
      next();
    }
  );
});

// WebSocket connection handler
io.on("connection", (socket) => {
  const userId = socket.data.userId;
  if (!userId) {
    console.log("Unauthorized connection attempt");
    return socket.disconnect();
  }

  // Register user in active connections
  activeUsers[userId] = socket.id;
  console.log(`User ${userId} connected with socket ${socket.id}`);

  // Notify user about successful connection
  socket.emit("connection-status", {
    status: "connected",
    message: "WebSocket connection established",
  });

  // Private message handler
  socket.on(
    "private-message",
    async (data: {
      content: string;
      receiverId: string;
      createdAt: string;
    }) => {
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
    }
  );

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

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? undefined
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/login", loginRoutes);
app.use("/home", homeRoutes);
app.use("/friends", friendsRoutes);

// Production static serving
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend-dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend-dist", "index.html"));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
