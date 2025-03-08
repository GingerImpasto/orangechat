import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Define a type for your data
type ApiResponse = {
  message: string;
};

// Example route
app.get("/api/data", (req: Request, res: Response<ApiResponse>) => {
  const response: ApiResponse = {
    message: "Hello from the TypeScript backend!",
  };
  res.json(response);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
