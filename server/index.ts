import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectDatabase } from "./lib/database";
import userRoutes from "./routes/users";
import adminAuthRoutes from "./routes/admin-auth";
import presentationRoutes from "./routes/presentations-sb";
import adminUsersRoutes from "./routes/admin-users";
import questionsRoutes from "./routes/questions-sb";
import siteRoutes from "./routes/site";
import { ensureInitialOwner } from "./lib/seed";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.options("*", cors());
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ extended: true, limit: "60mb" }));

  // Connect to database (legacy Prisma used for other models; Supabase used elsewhere)
  connectDatabase();

  // Ensure initial admin user exists only in development (avoid serverless cold-start side effects)
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DISABLE_SEED !== "1"
  ) {
    ensureInitialOwner();
  }

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

  // Questions routes
  app.use("/api/questions", questionsRoutes);

  // Site routes (About, reference)
  app.use("/api/site", siteRoutes);

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
