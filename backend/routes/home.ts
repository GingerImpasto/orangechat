import express from "express";

const router = express.Router();

// Route to handle user logout
router.post("/logout", (req: any, res: any) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie

    // Log the session cookie after destroying it
    console.log("Session Cookie After Logout:", req.headers.cookie);

    res.status(200).json({ message: "Logout successful" });
  });
});

export default router;
