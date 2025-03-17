import express from "express";
import { checkAuth, loginUser, signupUser } from "../auth";

const router = express.Router();

router.get("/check-auth", checkAuth);
router.post("/submit-login-form", loginUser);
router.post("/submit-signup-form", signupUser);

// Export the router
export default router;
