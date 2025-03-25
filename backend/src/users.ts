import supabase from "./supabase-client";
import { RegisterForm } from "./types";
import bcrypt from "bcryptjs";

// Function to check if a user exists
export const checkUserExistence = async (email: string): Promise<boolean> => {
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    throw new Error(userError.message);
  }

  return !!existingUser; // Returns true if user exists, false otherwise
};

// Function to create a new user
export const createUser = async (userData: RegisterForm) => {
  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert([{ ...userData, password: hashedPassword }]) // Store hashed password
    .select()
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return newUser;
};

export const fetchUser = async (email: string) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return user;
};

// Function to fetch users from Supabase, excluding the user with the given email
export const getOtherUsers = async (email: string) => {
  try {
    // Fetch all users except the one with the current user's ID
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .neq("email", email) // Exclude the current user
      .order("firstName", { ascending: true }); // Sort by firstName

    if (usersError) {
      throw usersError;
    }

    return users;
  } catch (error) {
    console.error("Error in getOtherUsers:", error);
    throw error;
  }
};

/**
 * Updates the profile data in the Supabase table.
 */
export const updateProfile = async (
  userId: string,
  firstName: string,
  lastName: string,
  profileImageUrl: string | null
): Promise<void> => {
  const { data, error } = await supabase
    .from("users")
    .update({ firstName, lastName, profileImageUrl })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

export async function getUserMessageImages(userId: string): Promise<string[]> {
  const { data: messagesWithImages, error } = await supabase
    .from("messages")
    .select("imageUrl")
    .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
    .not("imageUrl", "is", null);

  if (error) throw new Error(`Failed to get message images: ${error.message}`);

  return (
    (messagesWithImages
      ?.map((msg) => msg.imageUrl?.split("whisperchat-images/")[1])
      .filter(Boolean) as string[]) || []
  );
}

export async function getUserProfilePicture(
  userId: string
): Promise<string | null> {
  const { data: user, error } = await supabase
    .from("users")
    .select("profileImageUrl")
    .eq("id", userId)
    .single();

  if (error) throw new Error(`Failed to get user profile: ${error.message}`);

  return user?.profileImageUrl
    ? user.profileImageUrl.split("whisperchat-images/")[1]
    : null;
}

export async function deleteStorageFiles(filePaths: string[]): Promise<void> {
  if (filePaths.length === 0) return;

  const { error } = await supabase.storage
    .from("whisperchat-images")
    .remove(filePaths);

  if (error)
    throw new Error(`Failed to delete storage files: ${error.message}`);
}

export async function deleteUserMessages(userId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .delete()
    .or(`senderId.eq.${userId},receiverId.eq.${userId}`);

  if (error) throw new Error(`Failed to delete messages: ${error.message}`);
}

export async function deleteUserRecord(userId: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) throw new Error(`Failed to delete user record: ${error.message}`);
}
