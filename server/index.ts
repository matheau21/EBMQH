import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { connectDatabase } from "./lib/database.js";
import userRoutes from "./routes/users.js";
import adminAuthRoutes from "./routes/admin-auth.js";
import presentationRoutes from "./routes/presentations-sb.js";
import adminUsersRoutes from "./routes/admin-users.js";
import adminSyncFilesRoutes from "./routes/admin-sync-files.js";
import questionsRoutes from "./routes/questions-sb.js";
import siteRoutes from "./routes/site.js";
import { ensureInitialOwner } from "./lib/seed.js";
import { runWithTimeout, supabaseAdmin } from "./lib/supabase.js";

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

  // Admin file sync (Supabase)
  app.use("/api/admin/sync-files", adminSyncFilesRoutes);

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

  // Diagnostics for presentations/supabase in production
  app.get("/api/diag/presentations", async (_req, res) => {
    try {
      const t0 = Date.now();
      const totalRes = await runWithTimeout(
        supabaseAdmin
          .from("presentations")
          .select("id", { count: "exact", head: true }),
      );
      const approvedRes = await runWithTimeout(
        supabaseAdmin
          .from("presentations")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
      );
      const sampleRes = await runWithTimeout(
        supabaseAdmin
          .from("presentations")
          .select("id,title,status,created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(3),
      );
      const duration = Date.now() - t0;
      res.json({
        env: process.env.NODE_ENV || "development",
        supabaseKeyMode: process.env.SUPABASE_SERVICE_ROLE
          ? "service_role"
          : process.env.SUPABASE_ANON_KEY
            ? "anon"
            : "none",
        totals: {
          total: totalRes.count || 0,
          approved: approvedRes.count || 0,
        },
        sample: sampleRes.data || [],
        durationMs: duration,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || String(err) });
    }
  });

  return app;
}
