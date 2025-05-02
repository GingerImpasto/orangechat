import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRoutes from "./routes/login";
import homeRoutes from "./routes/home";
import friendsRoutes from "./routes/friends";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to accept requests from frontend in development
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? undefined // Use default CORS in production
        : "http://localhost:5173", // Allow Vite dev server
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/login", loginRoutes);
app.use("/home", homeRoutes);
app.use("/friends", friendsRoutes);

// Serve frontend in production only
if (process.env.NODE_ENV === "production") {
  // Serve static files
  app.use(express.static(path.join(__dirname, "../frontend-dist")));
  // Fallback to index.html for client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend-dist", "index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
