import express, { Request, Response } from "express";
import { getOtherUsers } from "../users";

const router = express.Router();

// Route to handle user logout
router.post("/logout", (req: any, res: any) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie

    res.status(200).json({ message: "Logout successful" });
  });
});

// Route to get all users except the one with the provided email
router.get("/getOtherUsers", async (req: any, res: any) => {
  const { email } = req.query; // Get the email from query parameters

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    const users = await getOtherUsers(email);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
