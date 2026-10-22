import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import pantryRoutes from "./routes/pantry.js";
import recipeRoutes from "./routes/recipes.js";
import mealPlanRoutes from "./routes/mealPlans.js";
import shoppingListRoutes from "./routes/shoppingList.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Refusing to start.");
  process.exit(1);
}

const app = express();

// Render and similar hosts sit behind a proxy; needed for correct client IPs
app.set("trust proxy", 1);

// CORS: only allow the frontend URL(s) listed in FRONTEND_URL (comma-separated)
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, health checks) are allowed
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "AI Recipe Generator API" });
});

// API health check
app.get("/api", (req, res) => {
  res.json({
    status: "success",
    message: "AI Recipe Generator API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/shopping-list", shoppingListRoutes);

// 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Postgres error codes that mean "bad input", not "server broke"
const PG_CLIENT_ERRORS = {
  "23505": [409, "That value is already in use"],
  "23503": [400, "Referenced item does not exist"],
  "23502": [400, "A required field is missing"],
  "23514": [400, "A field has an invalid value"],
  "22P02": [400, "A field has an invalid format"],
  "22007": [400, "Invalid date"],
  "22008": [400, "Invalid date"],
  "22003": [400, "A number is out of range"],
  "22001": [400, "A value is too long"],
};

// Error handler: never send internal error details to the client
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }

  if (error.code && PG_CLIENT_ERRORS[error.code]) {
    const [status, message] = PG_CLIENT_ERRORS[error.code];
    return res.status(status).json({ success: false, message });
  }

  const statusCode = error.statusCode || error.status || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && !error.expose
        ? "Internal Server Error"
        : error.message || "Request failed",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
