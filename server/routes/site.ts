import express, { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
import { authenticateAdminToken, AdminAuthRequest } from "../middleware/adminAuth.js";

const router = express.Router();

const AboutSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().nullable(),
  sections: z.array(z.object({ heading: z.string().min(1).max(200), body: z.string().min(1).max(5000) })).max(20).default([]),
  referenceCard: z.object({
    url: z.string().url().optional().nullable(),
    filePath: z.string().optional().nullable(),
  }).default({}),
});

const STORAGE_BUCKET = "presentations"; // reuse existing bucket
const ABOUT_PATH = "site/about.json";

router.get("/about", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(ABOUT_PATH);
    if (error || !data) {
      // Default content when none is configured
      return res.json({
        title: "About EBM Quick Hits",
        subtitle: "Concise, consistent, evidence-based summaries.",
        sections: [
          { heading: "Our Mission", body: "We provide evidence-based medicine summaries to support medical education and clinical practice." },
        ],
        referenceCard: {},
      });
    }
    const text = await data.text();
    let parsed: any;
    try { parsed = JSON.parse(text); } catch {
      parsed = null;
    }
    if (!parsed) {
      return res.json({
        title: "About EBM Quick Hits",
        subtitle: "Concise, consistent, evidence-based summaries.",
        sections: [],
        referenceCard: {},
      });
    }

    // If filePath exists, create a short-lived signed URL
    if (parsed?.referenceCard?.filePath) {
      const { data: signed } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(parsed.referenceCard.filePath, 60 * 60);
      parsed.referenceCard.signedUrl = signed?.signedUrl || null;
    }

    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/about", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const body = AboutSchema.parse(req.body);
    const payload = JSON.stringify(body, null, 2);
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(ABOUT_PATH, Buffer.from(payload), { contentType: "application/json", upsert: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Saved" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reference/upload", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { filename, contentBase64 } = z.object({ filename: z.string().min(1), contentBase64: z.string().min(10) }).parse(req.body);
    const buffer = Buffer.from(contentBase64, "base64");
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `site/reference/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: "application/octet-stream", upsert: true });
    if (upErr) return res.status(500).json({ error: upErr.message });
    return res.json({ message: "Uploaded", path });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
