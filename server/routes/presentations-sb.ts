import express, { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
import { authenticateAdminToken, AdminAuthRequest, requireAdminOrOwner } from "../middleware/adminAuth.js";

const router = express.Router();

const createSchema = z.object({
  title: z.string().min(1).max(500),
  specialty: z.string().min(1).optional(),
  specialties: z.array(z.string().min(1)).optional(),
  summary: z.string().min(1),
  authors: z.string().optional(),
  journal: z.string().optional(),
  year: z.string().optional(),
  originalArticleUrl: z.string().url().optional(),
  thumbUrl: z.string().url().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  specialty: z.string().min(1).optional(),
  specialties: z.array(z.string().min(1)).optional(),
  summary: z.string().min(1).optional(),
  authors: z.string().optional(),
  journal: z.string().optional(),
  year: z.string().optional(),
  originalArticleUrl: z.string().url().optional(),
  thumbUrl: z.string().url().optional(),
  status: z.enum(["pending", "approved", "rejected", "archived"]).optional(),
});

// GET /api/presentations (public: approved only)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", specialty, search } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("presentations")
      .select("id, title, specialty, specialties, summary, authors, journal, year, original_article_url, thumb_url, viewer_count, created_at, updated_at", { count: "exact" })
      .eq("status", "approved");

    if (specialty) query = query.or(`specialty.eq.${specialty},specialties.cs.{${specialty}}`);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    return res.json({
      presentations: (data || []).map((p) => ({
        id: p.id,
        title: p.title,
        specialty: p.specialty,
        specialties: p.specialties || [],
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
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error("List presentations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/admin - list all statuses (admin/owner)
router.get("/admin", authenticateAdminToken, requireAdminOrOwner, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "10", specialty, search, status } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("presentations")
      .select("*", { count: "exact" });

    if (specialty) query = query.or(`specialty.eq.${specialty},specialties.cs.{${specialty}}`);
    if (search) query = query.ilike("title", `%${search}%`);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    return res.json({
      presentations: data,
      pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/admin/:id - get single (admin/owner)
router.get("/admin/:id", authenticateAdminToken, requireAdminOrOwner, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from("presentations").select("*").eq("id", id).single();
    if (error || !data) return res.status(404).json({ error: "Not found" });
    return res.json({ presentation: data });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/proxy-pdf?src=...
router.get("/proxy-pdf", async (req: Request, res: Response) => {
  try {
    const src = (req.query.src as string) || "";
    if (!src) return res.status(400).json({ error: "Missing src" });
    let u: URL;
    try {
      u = new URL(src);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }
    if (!(u.protocol === "http:" || u.protocol === "https:")) {
      return res.status(400).json({ error: "Invalid protocol" });
    }
    const r = await fetch(u.toString(), { headers: { "user-agent": "Mozilla/5.0" } });
    if (!r.ok) return res.status(502).json({ error: `Upstream error ${r.status}` });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, max-age=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const ab = await r.arrayBuffer();
    return res.send(Buffer.from(ab));
  } catch (err) {
    return res.status(500).json({ error: "Proxy error" });
  }
});

// GET /api/presentations/files - get signed URLs for files (public for approved)
router.get("/:id/files", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from("presentations")
      .select("status, pdf_path, ppt_path, original_article_url")
      .eq("id", id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Presentation not found" });
    if (data.status !== "approved") return res.status(403).json({ error: "Not available" });

    let pdfUrl: string | undefined;
    let pptUrl: string | undefined;

    if (data.pdf_path) {
      const { data: signed, error: se } = await supabaseAdmin.storage
        .from("presentations")
        .createSignedUrl(data.pdf_path, 60 * 60); // 1 hour
      if (!se && signed?.signedUrl) pdfUrl = signed.signedUrl;
    }

    if (!pdfUrl && data.original_article_url) {
      pdfUrl = data.original_article_url;
    }

    if (data.ppt_path) {
      const { data: signed, error: se } = await supabaseAdmin.storage
        .from("presentations")
        .createSignedUrl(data.ppt_path, 60 * 60); // 1 hour
      if (!se && signed?.signedUrl) pptUrl = signed.signedUrl;
    }

    return res.json({ pdfUrl, pptUrl });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/specialties
router.get("/specialties", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("presentations")
      .select("specialty")
      .eq("status", "approved")
      .order("specialty", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    const specialties = Array.from(new Set((data || []).map((d) => d.specialty)));
    return res.json({ specialties });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/:id (public: if approved)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("presentations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Presentation not found" });
    if (data.status !== "approved") return res.status(403).json({ error: "Not available" });

    // Do not increment here; use explicit /view endpoint

    return res.json({
      presentation: {
        id: data.id,
        title: data.title,
        specialty: data.specialty,
        summary: data.summary,
        authors: data.authors || undefined,
        journal: data.journal || undefined,
        year: data.year || undefined,
        thumbnail: data.thumb_url || undefined,
        presentationFileUrl: undefined,
        originalArticleUrl: data.original_article_url || undefined,
        viewerCount: data.viewer_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/presentations/:id/view - increment view count (used after 10s on client)
router.post("/:id/view", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from("presentations")
      .select("viewer_count")
      .eq("id", id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Presentation not found" });

    const current = data.viewer_count || 0;
    const { error: upErr } = await supabaseAdmin
      .from("presentations")
      .update({ viewer_count: current + 1 })
      .eq("id", id);
    if (upErr) return res.status(500).json({ error: upErr.message });

    return res.json({ viewerCount: current + 1 });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/presentations - create (user=>pending, admin/owner=>approved)
router.post("/", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body);
    const role = req.adminUser!.role;
    const { data, error } = await supabaseAdmin
      .from("presentations")
      .insert({
        title: body.title,
        specialty: body.specialty,
        summary: body.summary,
        authors: body.authors,
        journal: body.journal,
        year: body.year,
        original_article_url: body.originalArticleUrl,
        thumb_url: body.thumbUrl,
        status: role === "user" ? "pending" : "approved",
        created_by: req.adminUser!.id,
      })
      .select("*")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: "Presentation created successfully", presentation: data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/presentations/:id - update (admin/owner or user on own pending)
router.put("/:id", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = updateSchema.parse(req.body);

    const { data: target, error: te } = await supabaseAdmin
      .from("presentations")
      .select("id, created_by, status")
      .eq("id", id)
      .single();
    if (te || !target) return res.status(404).json({ error: "Not found" });

    const isAdmin = req.adminUser!.role === "admin" || req.adminUser!.role === "owner";
    const isCreator = target.created_by === req.adminUser!.id;
    if (!isAdmin) {
      if (!isCreator) return res.status(403).json({ error: "Not allowed" });
      if (target.status !== "pending") return res.status(403).json({ error: "Cannot edit after approval" });
    }

    const patch: any = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.specialty !== undefined) patch.specialty = updates.specialty;
    if (updates.summary !== undefined) patch.summary = updates.summary;
    if (updates.authors !== undefined) patch.authors = updates.authors;
    if (updates.journal !== undefined) patch.journal = updates.journal;
    if (updates.year !== undefined) patch.year = updates.year;
    if (updates.originalArticleUrl !== undefined) patch.original_article_url = updates.originalArticleUrl;
    if (updates.thumbUrl !== undefined) patch.thumb_url = updates.thumbUrl;
    if (isAdmin && updates.status) patch.status = updates.status;

    const { data, error } = await supabaseAdmin
      .from("presentations")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Presentation updated successfully", presentation: data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/presentations/:id - delete (admin/owner)
router.delete("/:id", authenticateAdminToken, requireAdminOrOwner, async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("presentations").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Presentation deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});


// PATCH /api/presentations/:id/status - approve/reject (admin/owner)
router.patch("/:id/status", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!(req.adminUser!.role === "admin" || req.adminUser!.role === "owner")) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(["pending","approved","rejected","archived"]) }).parse(req.body);
    const { data, error } = await supabaseAdmin
      .from("presentations")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Status updated", presentation: data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/presentations/:id/upload - upload pdf/ppt (auth; user only for own)
router.post("/:id/upload", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fileType, contentBase64, filename } = z
      .object({ fileType: z.enum(["pdf","ppt","pptx"]), contentBase64: z.string().min(10), filename: z.string().min(1) })
      .parse(req.body);

    const { data: pres, error: fe } = await supabaseAdmin
      .from("presentations")
      .select("id, created_by, status")
      .eq("id", id)
      .single();
    if (fe || !pres) return res.status(404).json({ error: "Presentation not found" });

    const isAdmin = req.adminUser!.role === "admin" || req.adminUser!.role === "owner";
    if (!isAdmin) {
      if (pres.created_by !== req.adminUser!.id) return res.status(403).json({ error: "Not allowed" });
      if (pres.status !== "pending") return res.status(403).json({ error: "Cannot modify files after approval" });
    }

    const buffer = Buffer.from(contentBase64, "base64");
    const path = `${id}/${fileType}/${Date.now()}_${filename}`;
    const contentType = fileType === "pdf" ? "application/pdf" : (fileType === "ppt" ? "application/vnd.ms-powerpoint" : "application/vnd.openxmlformats-officedocument.presentationml.presentation");

    const { error: upErr } = await supabaseAdmin.storage.from("presentations").upload(path, buffer, { contentType, upsert: true });
    if (upErr) return res.status(500).json({ error: upErr.message });

    const patch: any = {};
    if (fileType === "pdf") patch.pdf_path = path; else patch.ppt_path = path;
    const { error: upDb } = await supabaseAdmin.from("presentations").update(patch).eq("id", id);
    if (upDb) return res.status(500).json({ error: upDb.message });

    return res.json({ message: "File uploaded", path });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/presentations/:id/file - remove pdf or ppt
router.delete("/:id/file", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = (req.query as any) as { type?: string };
    if (!(type === "pdf" || type === "ppt")) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const { data: pres, error: fe } = await supabaseAdmin
      .from("presentations")
      .select("id, created_by, status, pdf_path, ppt_path")
      .eq("id", id)
      .single();
    if (fe || !pres) return res.status(404).json({ error: "Presentation not found" });

    const isAdmin = req.adminUser!.role === "admin" || req.adminUser!.role === "owner";
    if (!isAdmin) {
      if (pres.created_by !== req.adminUser!.id) return res.status(403).json({ error: "Not allowed" });
      if (pres.status !== "pending") return res.status(403).json({ error: "Cannot modify files after approval" });
    }

    const path = type === "pdf" ? pres.pdf_path : pres.ppt_path;
    if (path) {
      await supabaseAdmin.storage.from("presentations").remove([path]);
    }

    const patch: any = {};
    if (type === "pdf") patch.pdf_path = null; else patch.ppt_path = null;
    const { error: upDb } = await supabaseAdmin.from("presentations").update(patch).eq("id", id);
    if (upDb) return res.status(500).json({ error: upDb.message });

    return res.json({ message: "File removed" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List own submissions
router.get("/mine", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("presentations")
      .select("*")
      .eq("created_by", req.adminUser!.id)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ presentations: data, pagination: { page: 1, limit: data?.length || 0, total: data?.length || 0, pages: 1 } });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
