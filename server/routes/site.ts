import express, { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
import {
  authenticateAdminToken,
  AdminAuthRequest,
} from "../middleware/adminAuth.js";

const router = express.Router();

const AboutSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().nullable(),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1).max(200),
        body: z.string().min(1).max(5000),
      }),
    )
    .max(20)
    .default([]),
  referenceCard: z
    .object({
      url: z.string().url().optional().nullable(),
      filePath: z.string().optional().nullable(),
    })
    .default({}),
  suggestedCurriculum: z
    .object({
      url: z.string().url().optional().nullable(),
      filePath: z.string().optional().nullable(),
    })
    .default({}),
});

const STORAGE_BUCKET = "presentations"; // reuse existing bucket
const ABOUT_PATH = "site/about.json";
const FEATURED_PATH = "site/featured.json";
const CONTACT_PATH = "site/contact.json";
const PRIVACY_PATH = "site/privacy.json";

router.get("/about", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(ABOUT_PATH);
    if (error || !data) {
      // Default content when none is configured
      return res.json({
        title: "About EBM Quick Hits",
        subtitle: "Concise, consistent, evidence-based summaries.",
        sections: [
          {
            heading: "Our Mission",
            body: "We provide evidence-based medicine summaries to support medical education and clinical practice.",
          },
        ],
        referenceCard: {},
        suggestedCurriculum: {},
      });
    }
    const text = await data.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
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

    // If filePath exists, create a short-lived signed URL for reference card
    if (parsed?.referenceCard?.filePath) {
      const { data: signed } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(parsed.referenceCard.filePath, 60 * 60);
      parsed.referenceCard.signedUrl = signed?.signedUrl || null;
    }

    // If filePath exists, create a short-lived signed URL for suggested curriculum
    if (parsed?.suggestedCurriculum?.filePath) {
      const { data: signed } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(parsed.suggestedCurriculum.filePath, 60 * 60);
      parsed.suggestedCurriculum.signedUrl = signed?.signedUrl || null;
    }

    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/about",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      if (
        !(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const body = AboutSchema.parse(req.body);
      const payload = JSON.stringify(body, null, 2);
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(ABOUT_PATH, Buffer.from(payload), {
          contentType: "application/json",
          upsert: true,
        });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: "Saved" });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get featured presentations (public)
router.get("/featured", async (_req: Request, res: Response) => {
  try {
    // Load manual config
    const { data } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(FEATURED_PATH);
    let ids: string[] = [];
    if (data) {
      try {
        const parsed = JSON.parse(await data.text());
        if (Array.isArray(parsed?.ids))
          ids = parsed.ids.filter((v: any) => typeof v === "string");
      } catch {}
    }

    let items: any[] = [];
    let source: "manual" | "recent" = "manual";

    if (ids.length > 0) {
      const { data: pres, error } = await supabaseAdmin
        .from("presentations")
        .select(
          "id, title, specialty, summary, authors, journal, year, original_article_url, thumb_url, viewer_count, created_at, updated_at, status",
        )
        .in("id", ids)
        .eq("status", "approved");
      if (!error && pres) {
        const order = new Map(ids.map((id, idx) => [id, idx] as const));
        pres.sort(
          (a: any, b: any) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
        );
        items = pres.slice(0, 3).map((p: any) => ({
          id: p.id,
          title: p.title,
          specialty: p.specialty,
          summary: p.summary,
          authors: p.authors || undefined,
          journal: p.journal || undefined,
          year: p.year || undefined,
          thumbnail: p.thumb_url || undefined,
          presentationFileUrl: undefined,
          originalArticleUrl: p.original_article_url || undefined,
          viewerCount: p.viewer_count || 0,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
      }
    }

    if (items.length === 0) {
      // Fallback: most recent 3 approved
      source = "recent";
      const { data: recent } = await supabaseAdmin
        .from("presentations")
        .select(
          "id, title, specialty, summary, authors, journal, year, original_article_url, thumb_url, viewer_count, created_at, updated_at",
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3);
      items = (recent || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        specialty: p.specialty,
        summary: p.summary,
        authors: p.authors || undefined,
        journal: p.journal || undefined,
        year: p.year || undefined,
        thumbnail: p.thumb_url || undefined,
        presentationFileUrl: undefined,
        originalArticleUrl: p.original_article_url || undefined,
        viewerCount: p.viewer_count || 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    }

    return res.json({ presentations: items, source });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Save featured presentations (admin/owner)
router.put(
  "/featured",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      if (
        !(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { ids } = z
        .object({ ids: z.array(z.string().min(1)).max(10) })
        .parse(req.body);
      const payload = JSON.stringify({ ids }, null, 2);
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(FEATURED_PATH, Buffer.from(payload), {
          contentType: "application/json",
          upsert: true,
        });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: "Saved" });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/reference/upload",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      if (
        !(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { filename, contentBase64 } = z
        .object({
          filename: z.string().min(1),
          contentBase64: z.string().min(10),
        })
        .parse(req.body);
      const buffer = Buffer.from(contentBase64, "base64");
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `site/reference/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(path, buffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });
      if (upErr) return res.status(500).json({ error: upErr.message });
      return res.json({ message: "Uploaded", path });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Contact content
const ContactSchema = z.object({
  title: z.string().min(1).max(200).default("Contact Us"),
  body: z.string().max(5000).default("Email us at example@example.com"),
  email: z.string().email().optional().nullable(),
});

router.get("/contact", async (_req: Request, res: Response) => {
  try {
    const { data } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(CONTACT_PATH);
    if (!data)
      return res.json({
        title: "Contact Us",
        body: "Email us at example@example.com",
        email: null,
      });
    const text = await data.text();
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.json({
        title: "Contact Us",
        body: "Email us at example@example.com",
        email: null,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/contact",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      if (
        !(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")
      ) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const body = ContactSchema.parse(req.body);
      const payload = JSON.stringify(body, null, 2);
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(CONTACT_PATH, Buffer.from(payload), {
          contentType: "application/json",
          upsert: true,
        });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: "Saved" });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Privacy content (similar to About)
const PrivacySchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().nullable(),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1).max(200),
        body: z.string().min(1).max(5000),
      }),
    )
    .max(20)
    .default([]),
});

router.get("/privacy", async (_req: Request, res: Response) => {
  try {
    const { data } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(PRIVACY_PATH);
    if (!data) {
      return res.json({
        title: "Privacy Policy",
        subtitle: "Your privacy matters to us.",
        sections: [
          { heading: "We respect your privacy", body: "We do not sell your information. We collect only what is necessary to provide and improve the service." },
          { heading: "Contact", body: "If you have questions about this policy, please contact us." },
        ],
      });
    }
    const text = await data.text();
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.json({ title: "Privacy Policy", sections: [] });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/privacy",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      if (!(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const body = PrivacySchema.parse(req.body);
      const payload = JSON.stringify(body, null, 2);
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(PRIVACY_PATH, Buffer.from(payload), {
          contentType: "application/json",
          upsert: true,
        });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: "Saved" });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
