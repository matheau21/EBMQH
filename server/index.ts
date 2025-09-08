import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { connectDatabase } from "./lib/database.js";
import userRoutes from "./routes/users.js";
import adminAuthRoutes from "./routes/admin-auth.js";
import presentationRoutes from "./routes/presentations.js";
import adminUsersRoutes from "./routes/admin-users.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Connect to database
  connectDatabase();

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Admin auth routes
  app.use("/api/admin", adminAuthRoutes);

  // User management routes (legacy)
  app.use("/api/users", userRoutes);

  // Admin users management (Supabase)
  app.use("/api/admin/users", adminUsersRoutes);

  // Presentation routes
  app.use("/api/presentations", presentationRoutes);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  return app;
}
