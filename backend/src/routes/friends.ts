// src/routes/friends.ts
import express, { Request, Response } from "express";
import supabase from "../supabase-client";
import { authenticateToken } from "../auth";
import { v4 as uuidv4 } from "uuid";
import { AsyncRequestHandler } from "../types";

const router = express.Router();

// Send a friend request
router.post("/sendFriendRequest", authenticateToken, (async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user?.id;

  if (!receiverId) {
    res.status(400).json({ error: "Receiver ID is required" });
    return;
  }

  if (senderId === receiverId) {
    res.status(400).json({ error: "Cannot send friend request to yourself" });
    return;
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
      return;
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
      return;
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
}) as AsyncRequestHandler);

router.get("/getPendingRequests", authenticateToken, (async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { data: requests, error: requestsError } = await supabase
      .from("friend_requests")
      .select("id, senderId, receiverId, status, createdAt, respondedAt")
      .eq("receiverId", userId)
      .eq("status", "pending")
      .order("createdAt", { ascending: false });

    if (requestsError) throw requestsError;
    if (!requests?.length) {
      res.json([]);
      return;
    }

    const senderIds = requests.map((r) => r.senderId);
    const { data: senders, error: usersError } = await supabase
      .from("users")
      .select("id, firstName, lastName, email, profileImageUrl")
      .in("id", senderIds);

    if (usersError) throw usersError;

    const formattedRequests = requests.map((request) => {
      const sender = senders?.find((u) => u.id === request.senderId);
      return {
        ...request,
        respondedAt: request.respondedAt || null,
        sender: sender
          ? {
              id: sender.id,
              firstName: sender.firstName,
              lastName: sender.lastName,
              email: sender.email,
              ...(sender.profileImageUrl && {
                profileImageUrl: sender.profileImageUrl,
              }),
            }
          : null,
      };
    });

    res.json(formattedRequests);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}) as AsyncRequestHandler);

// Accept a friend request
router.post("/acceptFriendRequest", authenticateToken, (async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user?.id;

  if (!requestId) {
    res.status(400).json({ error: "Request ID is required" });
    return;
  }
  console.log("Inside accept request handler");

  try {
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // Verify the receiver is the current user
    if (request.receiverId !== userId) {
      res.status(403).json({ error: "Not authorized to accept this request" });
      return;
    }

    // Update request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "accepted", respondedAt: new Date().toISOString() })
      .eq("id", requestId)
      .select();

    if (updateError) throw updateError;

    // Create mutual friendship records
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

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
}) as AsyncRequestHandler);

// Reject a friend request
router.post("/rejectFriendRequest", authenticateToken, (async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user?.id;

  if (!requestId) {
    res.status(400).json({ error: "Request ID is required" });
    return;
  }

  try {
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError) throw requestError;
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // Verify the receiver is the current user
    if (request.receiverId !== userId) {
      res.status(403).json({ error: "Not authorized to reject this request" });
      return;
    }

    // Update request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "rejected", respondedAt: new Date().toISOString() })
      .eq("id", requestId)
      .select();

    if (updateError) throw updateError;

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
}) as AsyncRequestHandler);

/// Get pending requests where current user is the receiver
router.get("/pendingRequests", authenticateToken, (async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Only get requests where current user is the receiver
    const { data: requests, error: requestsError } = await supabase
      .from("friend_requests")
      .select("id, senderId, receiverId, status, createdAt, respondedAt")
      .eq("receiverId", userId)
      .eq("status", "pending")
      .order("createdAt", { ascending: false });

    if (requestsError) throw requestsError;
    if (!requests?.length) {
      res.json([]);
      return;
    }

    // Get sender details
    const senderIds = requests.map((r) => r.senderId);
    const { data: senders, error: usersError } = await supabase
      .from("users")
      .select("id, firstName, lastName, email, profileImageUrl")
      .in("id", senderIds);

    if (usersError) throw usersError;

    const formattedRequests = requests.map((request) => {
      const sender = senders?.find((u) => u.id === request.senderId);
      return {
        ...request,
        respondedAt: request.respondedAt || null,
        sender: sender
          ? {
              id: sender.id,
              firstName: sender.firstName,
              lastName: sender.lastName,
              email: sender.email,
              ...(sender.profileImageUrl && {
                profileImageUrl: sender.profileImageUrl,
              }),
            }
          : null,
      };
    });

    res.json(formattedRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
}) as AsyncRequestHandler);
// Get friends list
router.get("/", authenticateToken, (async (req, res) => {
  const userId = req.user?.id;

  try {
    // First approach: Get friends using explicit joins
    const { data: friends, error } = await supabase
      .from("friends")
      .select(
        `
        friend:users!friends_friendId_fkey(
          id,
          firstName,
          lastName,
          email,
          profileImageUrl
        )
      `
      )
      .eq("userId", userId);

    if (error) throw error;
    if (!friends) throw new Error("No friends returned");

    // Extract and format the friend data
    const friendList = friends.map((f) => f.friend).filter(Boolean);
    res.json(friendList);
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ error: "Failed to fetch friends list" });
  }
}) as AsyncRequestHandler);

// Remove friend
router.delete("/:friendId", authenticateToken, (async (req, res) => {
  const userId = req.user?.id;
  const { friendId } = req.params;

  try {
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
}) as AsyncRequestHandler);

export default router;
