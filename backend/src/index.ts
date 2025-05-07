import express, { Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import loginRoutes from "./routes/login";
import homeRoutes from "./routes/home";
import friendsRoutes from "./routes/friends";
import cookieParser from "cookie-parser";
import path from "path";
import { initWebSocket } from "./socket";

const app = express();
const PORT = process.env.PORT || 5000;

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
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../frontend-dist", "index.html"));
  });
}

// Create HTTP server and initialize WebSocket
const server = http.createServer(app);
initWebSocket(server); // Initialize WebSocket with the HTTP server

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
