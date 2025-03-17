import supabase from "./supabase-client";
import { UploadImageResponse } from "./types";

// Function to store a message in Supabase
export const storeMessage = async (
  content: string,
  senderId: string,
  receiverId: string,
  imageUrl: string | null
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ content, senderId: senderId, receiverId: receiverId, imageUrl }])
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

export const uploadImageToSupabase = async (
  file: Express.Multer.File
): Promise<UploadImageResponse> => {
  try {
    // Generate a unique filename
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload the image to Supabase Storage
    const { data, error } = await supabase.storage
      .from("whisperchat-images") // Your bucket name
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return { imageUrl: null, error: "Failed to upload image" };
    }

    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("whisperchat-images")
      .getPublicUrl(fileName);

    return { imageUrl: publicUrlData.publicUrl };
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    return { imageUrl: null, error: "Internal server error" };
  }
};

export const deleteImageFromSupabase = async (
  fileName: string
): Promise<void> => {
  const bucketName = "whisperchat-images";

  const { error } = await supabase.storage.from(bucketName).remove([fileName]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  console.log("Image deleted successfully:", fileName);
};
