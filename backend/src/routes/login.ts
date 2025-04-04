import express from "express";
import { loginUser, signupUser, authenticateToken } from "../auth";
import { Request, Response } from "express";
const router = express.Router();

// Properly typed protected route
router.post(
  "/validate-token",
  (req, res, next) => {
    authenticateToken(req, res, next);
  },
  (req, res) => {
    // TypeScript now knows req.user exists
    const { id, email } = req.user!;

    res.json({
      message: "Access granted",
      user: { id, email },
      isValid: true,
    });
  }
);

router.post("/submit-login-form", loginUser);
router.post("/submit-signup-form", signupUser);

// Export the router
export default router;
