// src/routes/friends.ts
import express from "express";
import supabase from "../supabase-client";
import { authenticateToken } from "../auth";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Send a friend request
router.post("/requests", authenticateToken, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user?.id; // From auth middleware

  if (!receiverId) {
    res.status(400).json({ error: "Receiver ID is required" });
  }

  if (senderId === receiverId) {
    res.status(400).json({ error: "Cannot send friend request to yourself" });
  }

  try {
    // Check if users are already friends
    const { data: existingFriendship, error: friendsError } = await supabase
      .from("friends")
      .select("*")
      .or(`userId.eq.${senderId},friendId.eq.${senderId}`)
      .or(`userId.eq.${receiverId},friendId.eq.${receiverId}`);

    if (friendsError) throw friendsError;
    if (existingFriendship && existingFriendship.length > 0) {
      res.status(400).json({ error: "Users are already friends" });
    }

    // Check if there's already a pending request
    const { data: existingRequest, error: requestError } = await supabase
      .from("friend_requests")
      .select("*")
      .or(
        `and(senderId.eq.${senderId},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${senderId})`
      )
      .neq("status", "rejected");

    if (requestError) throw requestError;
    if (existingRequest && existingRequest.length > 0) {
      res.status(400).json({ error: "Friend request already exists" });
    }

    // Create new friend request
    const { data: request, error } = await supabase
      .from("friend_requests")
      .insert([
        {
          id: uuidv4(),
          senderId,
          receiverId,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    if (!request) throw new Error("No request returned");

    res.status(201).json(request[0]);
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Get friend requests (both sent and received)
router.get("/requests", authenticateToken, async (req, res) => {
  const userId = req.user?.id;

  try {
    const { data: requests, error } = await supabase
      .from("friend_requests")
      .select("*, sender:users(*), receiver:users(*)")
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
      .neq("status", "rejected");

    if (error) throw error;
    if (!requests) throw new Error("No requests returned");

    res.json({
      sent: requests.filter((request) => request.senderId === userId),
      received: requests.filter((request) => request.receiverId === userId),
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Respond to friend request (accept/reject)
router.patch("/requests/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;

  if (!["accepted", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
  }

  try {
    // First get the request to verify the receiver
    const { data: request, error: requestError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (requestError) throw requestError;
    if (!request) res.status(404).json({ error: "Request not found" });
    if (request.receiverId !== userId) {
      res
        .status(403)
        .json({ error: "Not authorized to respond to this request" });
    }

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from("friend_requests")
      .update({ status })
      .eq("id", id)
      .select();

    if (updateError) throw updateError;
    if (!updatedRequest) throw new Error("No updated request returned");

    // If accepted, create friendship in both directions
    if (status === "accepted") {
      const friendship1 = {
        userId: request.senderId,
        friendId: request.receiverId,
        createdAt: new Date().toISOString(),
      };

      const friendship2 = {
        userId: request.receiverId,
        friendId: request.senderId,
        createdAt: new Date().toISOString(),
      };

      const { error: friendsError } = await supabase
        .from("friends")
        .insert([friendship1, friendship2]);

      if (friendsError) throw friendsError;
    }

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ error: "Failed to respond to friend request" });
  }
});

// Get friends list
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user?.id;

  try {
    const { data: friends, error } = await supabase
      .from("friends")
      .select("friendId:users(*)")
      .eq("userId", userId);

    if (error) throw error;
    if (!friends) throw new Error("No friends returned");

    // Extract friend user objects
    const friendList = friends.map((f) => f.friendId);
    res.json(friendList);
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ error: "Failed to fetch friends list" });
  }
});

// Remove friend
router.delete("/:friendId", authenticateToken, async (req, res) => {
  const userId = req.user?.id;
  const { friendId } = req.params;

  try {
    // Delete both directions of friendship
    const { error: deleteError } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(userId.eq.${userId},friendId.eq.${friendId}),and(userId.eq.${friendId},friendId.eq.${userId})`
      );

    if (deleteError) throw deleteError;

    res.status(204).end();
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

export default router;
