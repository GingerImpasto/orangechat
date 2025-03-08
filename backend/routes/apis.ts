import express from "express";
const router = express.Router();
import supabase from "../supabase-client";

// Example route
router.get("/test", async (req, res) => {
  const response = {
    message: "init",
  };

  const { data, error } = await supabase.from("User").select("*");

  if (error) {
    console.log("Error fetching: ", error);
  } else {
    console.log(data);
    response.message = JSON.stringify({
      email: data[0].email,
      password: data[0].password,
    });
    res.json(response);
  }
});

// Define your API routes here
router.get("/users", (req, res) => {
  res.send("List of users");
});

router.post("/users", (req, res) => {
  res.send("Create a new user");
});

// Export the router
export default router;
