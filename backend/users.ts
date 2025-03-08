import supabase from "./supabase-client";
import { RegisterForm } from "./types";
import bcrypt from "bcryptjs";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);

  const { data, error } = await supabase.from("User").insert([
    {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  ]);

  if (error) {
    console.error("Error creating row:", error);
    return null;
  }

  const newUser = data ? data[0] : "";
  console.log("User created successfully:", newUser);
  //return { id: newUser.id, email: newUser.email };
  return newUser;
};
