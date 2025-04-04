import session from "express-session";
import { checkUserExistence, createUser, fetchUser } from "./users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Define your JWT payload type
interface JwtPayload {
  id: string;
  email: string;
  [key: string]: any;
}

console.log("Environment:", process.env.NODE_ENVIRONMENT);
const JWT_SECRET: string = process.env.JWT_SECRET ? process.env.JWT_SECRET : "";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      email: string;
      [key: string]: any;
    };
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(403).json({
        message:
          err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      });
      return;
    }

    req.user = decoded as { id: string; email: string };
    next();
  });
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

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    // Return a success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
      token: token,
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

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    // Redirect to the home page
    return res.status(201).json({
      message: "Registration successful",
      user: newUser,
      token: token,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
