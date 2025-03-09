import supabase from "./supabase-client";
import { RegisterForm } from "./types";

export const checkUserExistence = async (form: RegisterForm) => {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("email", form.email)
    .limit(1);

  if (error) {
    console.error("Error checking row:", error);
    return false;
  }

  return data.length > 0;
};
