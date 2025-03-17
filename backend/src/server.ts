import express, { Request, Response } from "express";
import cors from "cors";
import loginRoutes from "./routes/login";
import homeRoutes from "./routes/home";
import cookieParser from "cookie-parser";
import { cookieSession } from "./auth";
import path from "path";

const app = express();
const PORT = 5000;

// Serve the frontend's dist files
app.use(express.static(path.join(__dirname, "../frontend-dist")));

// Middleware
// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true, // Allow credentials (cookies)
  })
);

app.use(express.json());
app.use(cookieParser());

// Configure session middleware
app.use(cookieSession);

app.use("/login", loginRoutes);
app.use("/home", homeRoutes);

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend-dist", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
