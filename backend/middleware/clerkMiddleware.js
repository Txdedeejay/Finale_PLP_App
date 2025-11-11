// middleware/clerkAuth.js
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// Create reusable middleware
// This will automatically verify JWTs sent in the Authorization header
const requireClerkAuth = ClerkExpressRequireAuth({
  apiKey: process.env.CLERK_API_KEY, // your backend API key
  jwtKey: process.env.CLERK_JWT_KEY  // JWT verification key
});

module.exports = requireClerkAuth;
