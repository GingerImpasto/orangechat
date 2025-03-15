import express, { Request, Response } from "express";
import { getOtherUsers } from "../users";
import {
  fetchMessagesBetweenUsers,
  storeMessage,
  uploadImageToSupabase,
} from "../messages";
import multer from "multer";

const router = express.Router();

// Configure multer for file storage
const upload = multer({ storage: multer.memoryStorage() });

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

// Route to handle message submission
router.post(
  "/sendMessage",
  upload.single("image"),
  async (req: any, res: any) => {
    const { content, senderId, receiverId } = req.body;
    const imageFile = req.file;

    let imageUrl: string | null = null;

    if (imageFile) {
      // Use the utility function to upload the image to Supabase
      const { imageUrl: uploadedImageUrl, error } = await uploadImageToSupabase(
        imageFile
      );

      if (error) {
        return res.status(500).json({ error });
      }

      imageUrl = uploadedImageUrl;
    }

    if (!content || !senderId || !receiverId) {
      return res.status(400).json({
        error: "All fields (content, senderId, receiverId) are required",
      });
    }

    try {
      // Store the message using the storeMessage function
      const data = await storeMessage(content, senderId, receiverId, imageUrl);
      res.status(201).json({ success: true, data: data });
    } catch (error) {
      console.error("Error storing message:", error);
      res.status(500).json({ error: "Failed to store message" });
    }
  }
);

// Endpoint to fetch messages between two users
router.get("/getMessagesbetweenUsers", async (req: any, res: any) => {
  const { loggedInUserId, selectedUserId } = req.query;

  if (!loggedInUserId || !selectedUserId) {
    return res
      .status(400)
      .json({ error: "Both loggedInUserId and selectedUserId are required" });
  }

  try {
    const messages = await fetchMessagesBetweenUsers(
      loggedInUserId,
      selectedUserId
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
