import express, { Request, Response } from "express";
import { getOtherUsers, updateProfile } from "../users";
import {
  fetchMessagesBetweenUsers,
  storeMessage,
  uploadImageToSupabase,
  deleteImageFromSupabase,
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

// POST endpoint to handle profile updates
router.post(
  "/profileUpdate",
  upload.single("profileImage"),
  async (req: any, res: any) => {
    const { userId, firstName, lastName, currentImageUrl } = req.body;
    const file = req.file;
    let profileImageUrl = null;

    try {
      // Step 1: Delete the old image
      // if it exists and no new image is provided
      if (!file && currentImageUrl) {
        const fileName = currentImageUrl.split("/").pop(); // Extract the file name from the URL
        console.log("deletion case", fileName, currentImageUrl);
        if (fileName) {
          await deleteImageFromSupabase(fileName);
        }
      }

      // Step 2: Upload the image to Supabase Storage (if a new image is provided)
      if (file) {
        // Use the utility function to upload the image to Supabase
        const { imageUrl: uploadedImageUrl, error } =
          await uploadImageToSupabase(file);

        if (error) {
          return res.status(500).json({ error });
        }

        profileImageUrl = uploadedImageUrl;
      }

      // Step 3: Update the profile data in the database
      await updateProfile(userId, firstName, lastName, profileImageUrl);

      // Send a success response
      res
        .status(200)
        .json({ message: "Profile updated successfully", profileImageUrl });
    } catch (error) {
      console.error("Error:", error);

      // Handle the error safely
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }
);

export default router;
