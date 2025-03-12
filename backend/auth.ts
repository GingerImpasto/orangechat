import session from "express-session";
import { checkUserExistence, createUser, fetchUser } from "./users";
import bcrypt from "bcryptjs";

export const cookieSession = session({
  secret: `${process.env.SESSION_SECRET}`, // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    maxAge: 1000 * 60 * 60 * 24, // Session expires in 1 day
  },
});

export const checkAuth = (req: any, res: any) => {
  if (req.session.user) {
    console.log("session user is ", req.session.user);
    res.status(200).json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
};

export const loginUser = async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Fetch the user from the database
    const user = await fetchUser(email);

    // If no user is found, throw an error
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create a session for the authenticated user
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Log the Set-Cookie header
    res.on("finish", () => {
      console.log("Set-Cookie Header:", res.getHeader("Set-Cookie"));
    });

    // Return a success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signupUser = async (req: any, res: any) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    const userExists = await checkUserExistence(email);
    if (userExists) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create a new user
    const newUser = await createUser({ email, password, firstName, lastName });

    // Return the newly created user data (excluding the password for security)
    const { password: _, ...userWithoutPassword } = newUser;

    // Log the user in by creating a session
    req.session.user = { id: newUser.id, email: newUser.email };

    // Redirect to the home page
    return res
      .status(201)
      .json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
