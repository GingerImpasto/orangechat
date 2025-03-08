import express, { Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/apis";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Supabase URL is ${process.env.SUPABASE_PROJECT_URL}`);
});
