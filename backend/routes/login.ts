import express from "express";
import supabase from "../supabase-client";

const router = express.Router();

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

// Handle form submission
router.post("/submit-login-form", (req, res) => {
  const { email, password } = req.body;

  // Process the data (e.g., save to a database)
  console.log("Received login form data:", { email, password });

  // Send a response back to the client
  res.json({
    message: "Login form data received successfully!",
    data: { email, password },
  });
});

router.post("/submit-signup-form", (req, res) => {
  const { email, password } = req.body;

  // Process the data (e.g., save to a database)
  console.log("Received signup form data:", { email, password });

  // Send a response back to the client
  res.json({
    message: "Signup form data received successfully!",
    data: { email, password },
  });
});

// Export the router
export default router;
