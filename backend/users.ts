import supabase from "./supabase-client";
import { RegisterForm } from "./types";
import bcrypt from "bcryptjs";

// Function to check if a user exists
export const checkUserExistence = async (email: string): Promise<boolean> => {
  const { data: existingUser, error: userError } = await supabase
    .from("User")
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
    .from("User")
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
    .from("User")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  console.log("User is ", user);
  return user;
};
