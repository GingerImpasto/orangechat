import express, { Request, Response } from "express";
import cors from "cors";
import loginRoutes from "./routes/login";
import homeRoutes from "./routes/home";
import cookieParser from "cookie-parser";
import { cookieSession } from "./auth";

const app = express();
const PORT = 5000;

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
