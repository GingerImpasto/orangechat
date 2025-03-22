import express from "express";
import { loginUser, signupUser, authenticateToken } from "../auth";

const router = express.Router();

// Protected route
router.post("/validate-token", authenticateToken, (req: any, res: any) => {
  // Access the user's id and email from the decoded token
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Optionally, you can query your database to verify the user's details
  // For example: const user = await User.findById(userId);

  res.json({ message: "Access granted", userId, userEmail });
});

router.post("/submit-login-form", loginUser);
router.post("/submit-signup-form", signupUser);

// Export the router
export default router;
