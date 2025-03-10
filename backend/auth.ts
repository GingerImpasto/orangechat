import session from "express-session";

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
