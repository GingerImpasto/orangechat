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

// Serve the frontend's dist files
app.use(express.static(path.join(__dirname, "../frontend-dist")));

// Middleware
// Configure CORS
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(cookieParser());

app.use("/login", loginRoutes);
app.use("/home", homeRoutes);
app.use("/friends", friendsRoutes);

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend-dist", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
