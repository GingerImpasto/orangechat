import express, { Request, Response } from "express";
import http from 'http'; // Add this import
import { Server } from 'socket.io'; // Add this import
import bodyParser from "body-parser";
import cors from "cors";
import loginRoutes from "./routes/login";
import homeRoutes from "./routes/home";
import friendsRoutes from "./routes/friends";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // Create HTTP server

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? undefined 
      : "http://localhost:5173",
    credentials: true
  }
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example event handler
  socket.on('message', (data) => {
    console.log('Received message:', data);
    // Broadcast to all clients
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware (existing code remains the same)
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? undefined
      : "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Existing routes
app.use("/login", loginRoutes);
app.use("/home", homeRoutes);
app.use("/friends", friendsRoutes);

// Production static serving (existing code)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend-dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend-dist", "index.html"));
  });
}

// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});