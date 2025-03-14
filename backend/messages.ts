import supabase from "./supabase-client";

// Function to store a message in Supabase
export const storeMessage = async (
  content: string,
  senderId: string,
  receiverId: string
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ content, senderId: senderId, receiverId: receiverId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Function to fetch messages between two users
export const fetchMessagesBetweenUsers = async (
  loggedInUserId: string,
  selectedUserId: string
) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(senderId.eq.${loggedInUserId},receiverId.eq.${selectedUserId}),` +
          `and(senderId.eq.${selectedUserId},receiverId.eq.${loggedInUserId})`
      )
      .order("createdAt", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
