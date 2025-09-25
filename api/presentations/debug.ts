import serverless from "serverless-http";
import express from "express";
import { supabaseAdmin, runWithTimeout } from "../../server/lib/supabase.js";

const app = express();

app.get("/api/presentations/debug", async (_req, res) => {
  try {
    const t0 = Date.now();
    const totalRes = await runWithTimeout(
      supabaseAdmin.from("presentations").select("id", { count: "exact", head: true }),
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
      supabaseKeyMode: process.env.SUPABASE_SERVICE_ROLE ? "service_role" : (process.env.SUPABASE_ANON_KEY ? "anon" : "none"),
      totals: { total: totalRes.count || 0, approved: approvedRes.count || 0 },
      sample: sampleRes.data || [],
      durationMs: duration,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

const handler = serverless(app);
export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}
