import { supabaseAdmin, runWithTimeout } from "../../server/lib/supabase.js";

export default async function vercelHandler(req: any, res: any) {
  try {
    const t0 = Date.now();

    // Get total and approved counts
    const { count: total } = await runWithTimeout(
      supabaseAdmin
        .from("presentations")
        .select("id", { count: "exact", head: true }),
    );
    const { count: approved } = await runWithTimeout(
      supabaseAdmin
        .from("presentations")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
    );

    // Get sample presentations with all fields to check schema
    const { data: sample, error: sampleErr } = await runWithTimeout(
      supabaseAdmin
        .from("presentations")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
    );

    // Try to get one presentation to examine file fields
    const { data: filesSample } = await runWithTimeout(
      supabaseAdmin
        .from("presentations")
        .select("id, title, status, pdf_path, ppt_path, original_article_url")
        .eq("status", "approved")
        .limit(1),
    );

    const duration = Date.now() - t0;

    const filesSampleInfo = filesSample?.[0]
      ? {
          id: filesSample[0].id,
          title: filesSample[0].title,
          status: filesSample[0].status,
          pdf_path: filesSample[0].pdf_path,
          ppt_path: filesSample[0].ppt_path,
          original_article_url: filesSample[0].original_article_url,
        }
      : null;

    return res.json({
      env: process.env.NODE_ENV || "development",
      supabaseKeyMode: process.env.SUPABASE_SERVICE_ROLE
        ? "service_role"
        : process.env.SUPABASE_ANON_KEY
          ? "anon"
          : "none",
      totals: { total: total || 0, approved: approved || 0 },
      sampleError: sampleErr?.message,
      sampleCount: sample?.length || 0,
      filesSampleInfo,
      durationMs: duration,
    });
  } catch (err: any) {
    console.error("[debug] error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
}
