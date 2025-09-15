import express, { Request, Response } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
import { authenticateAdminToken, AdminAuthRequest, requireAdminOrOwner } from "../middleware/adminAuth.js";

const router = express.Router();

const choiceSchema = z.object({
  content: z.string().min(1).max(2000),
  isCorrect: z.boolean(),
});

const highlightSchema = z.object({
  page: z.number().int().min(1),
  phrase: z.string().min(1).max(1000),
  occurrence: z.number().int().min(1).optional(),
  color: z.string().optional(),
  note: z.string().optional(),
});

const createSchema = z.object({
  prompt: z.string().min(1).max(5000),
  specialty: z.string().optional(),
  presentationId: z.string().uuid().optional(),
  explanation: z.string().optional(),
  referenceUrl: z.string().url().optional(),
  choices: z.array(choiceSchema).min(2).max(8),
  isActive: z.boolean().optional(),
  highlights: z.array(highlightSchema).optional(),
});

const updateSchema = z.object({
  prompt: z.string().min(1).max(5000).optional(),
  specialty: z.string().optional().nullable(),
  presentationId: z.string().uuid().optional().nullable(),
  explanation: z.string().optional().nullable(),
  referenceUrl: z.string().url().optional().nullable(),
  choices: z.array(choiceSchema).min(2).max(8).optional(),
  isActive: z.boolean().optional(),
  highlights: z.array(highlightSchema).optional().nullable(),
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Helper to load a question with choices
async function loadQuestion(id: string) {
  const { data: q, error } = await supabaseAdmin
    .from("questions")
    .select("id, prompt, specialty, presentation_id, explanation, reference_url, highlights, is_active, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error || !q) return { error: error?.message || "Not found" } as const;
  const { data: choices, error: ce } = await supabaseAdmin
    .from("question_choices")
    .select("id, content, is_correct, order_index")
    .eq("question_id", id)
    .order("order_index", { ascending: true });
  if (ce) return { error: ce.message } as const;
  return {
    question: {
      id: q.id,
      prompt: q.prompt,
      specialty: q.specialty || undefined,
      presentationId: q.presentation_id || undefined,
      explanation: q.explanation || undefined,
      referenceUrl: q.reference_url || undefined,
      highlights: (q as any).highlights || undefined,
      isActive: q.is_active,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      choices: (choices || []).map((c) => ({
        id: c.id,
        content: c.content,
        isCorrect: !!c.is_correct,
        orderIndex: c.order_index,
      })),
    },
  } as const;
}

// Public list questions (approved presentations association not required)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { specialty, presentationId, limit = "50", random } = req.query as any;
    const lim = Math.min(parseInt(String(limit) || "50"), 200);

    let query = supabaseAdmin
      .from("questions")
      .select("id, prompt, specialty, presentation_id, explanation, reference_url, highlights, is_active, status, created_at, updated_at")
      .eq("is_active", true)
      .eq("status", "approved");

    if (specialty) query = query.eq("specialty", specialty);
    if (presentationId) query = query.eq("presentation_id", presentationId);

    // Fetch a broad set and shuffle on server if random requested
    const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
    if (error) return res.status(500).json({ error: error.message });

    const base = random ? shuffle(data || []) : (data || []);
    const selected = base.slice(0, lim);

    // Load choices for selected questions
    const ids = selected.map((q) => q.id);
    const { data: choices, error: ce } = await supabaseAdmin
      .from("question_choices")
      .select("id, question_id, content, is_correct, order_index")
      .in("question_id", ids)
      .order("order_index", { ascending: true });
    if (ce) return res.status(500).json({ error: ce.message });

    const byQ: Record<string, any[]> = {};
    for (const c of choices || []) {
      (byQ[c.question_id] ||= []).push(c);
    }

    return res.json({
      questions: selected.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        specialty: q.specialty || undefined,
        presentationId: q.presentation_id || undefined,
        explanation: q.explanation || undefined,
        referenceUrl: q.reference_url || undefined,
        highlights: (q as any).highlights || undefined,
        isActive: q.is_active,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        choices: (byQ[q.id] || []).map((c) => ({ id: c.id, content: c.content, isCorrect: !!c.is_correct, orderIndex: c.order_index })),
      })),
      pagination: { page: 1, limit: lim, total: selected.length, pages: 1 },
    });
  } catch (err) {
    console.error("List questions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Admin list (with filters)
router.get("/admin", authenticateAdminToken, requireAdminOrOwner, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "10", specialty, presentationId, status } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabaseAdmin
      .from("questions")
      .select("id, prompt, specialty, presentation_id, explanation, reference_url, highlights, is_active, status, created_at, updated_at", { count: "exact" });

    if (specialty) query = query.eq("specialty", specialty);
    if (presentationId) query = query.eq("presentation_id", presentationId);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return res.status(500).json({ error: error.message });

    // Load choices
    const ids = (data || []).map((q) => q.id);
    let choicesMap: Record<string, any[]> = {};
    if (ids.length) {
      const { data: choices } = await supabaseAdmin
        .from("question_choices")
        .select("id, question_id, content, is_correct, order_index")
        .in("question_id", ids)
        .order("order_index", { ascending: true });
      for (const c of choices || []) {
        (choicesMap[c.question_id] ||= []).push(c);
      }
    }

    return res.json({
      questions: (data || []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        specialty: q.specialty || undefined,
        presentationId: q.presentation_id || undefined,
        explanation: q.explanation || undefined,
        referenceUrl: q.reference_url || undefined,
        highlights: (q as any).highlights || undefined,
        isActive: q.is_active,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        choices: (choicesMap[q.id] || []).map((c) => ({ id: c.id, content: c.content, isCorrect: !!c.is_correct, orderIndex: c.order_index })),
      })),
      pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Public get one
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, error } = await loadQuestion(id);
    if (error || !question) return res.status(404).json({ error: "Not found" });
    return res.json({ question });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create (admin/owner/user via admin auth)
router.post("/", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body);
    const correctCount = body.choices.filter((c) => c.isCorrect).length;
    if (correctCount !== 1) return res.status(400).json({ error: "Exactly one correct choice is required" });

    const role = req.adminUser!.role;
    const { data: q, error } = await supabaseAdmin
      .from("questions")
      .insert({
        prompt: body.prompt,
        specialty: body.specialty,
        presentation_id: body.presentationId,
        explanation: body.explanation,
        reference_url: body.referenceUrl,
        is_active: body.isActive ?? true,
        status: role === "user" ? "pending" : "approved",
        created_by: req.adminUser!.id,
        highlights: body.highlights || null,
      })
      .select("id")
      .single();

    if (error || !q) return res.status(500).json({ error: error?.message || "Failed to create" });

    const rows = body.choices.map((c, idx) => ({
      question_id: q.id,
      content: c.content,
      is_correct: c.isCorrect,
      order_index: idx,
    }));

    const { error: ce } = await supabaseAdmin.from("question_choices").insert(rows);
    if (ce) {
      await supabaseAdmin.from("questions").delete().eq("id", q.id);
      return res.status(500).json({ error: ce.message });
    }

    const loaded = await loadQuestion(q.id);
    return res.status(201).json({ message: "Question created", question: loaded.question });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update
router.put("/:id", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = updateSchema.parse(req.body);
    if (body.choices) {
      const correctCount = body.choices.filter((c) => c.isCorrect).length;
      if (correctCount !== 1) return res.status(400).json({ error: "Exactly one correct choice is required" });
    }

    const patch: any = {};
    if (body.prompt !== undefined) patch.prompt = body.prompt;
    if (body.specialty !== undefined) patch.specialty = body.specialty || null;
    if (body.presentationId !== undefined) patch.presentation_id = body.presentationId || null;
    if (body.explanation !== undefined) patch.explanation = body.explanation || null;
    if (body.referenceUrl !== undefined) patch.reference_url = body.referenceUrl || null;
    if (body.isActive !== undefined) patch.is_active = body.isActive;
    if (body.highlights !== undefined) patch.highlights = body.highlights;

    if (Object.keys(patch).length) {
      const { error: ue } = await supabaseAdmin.from("questions").update(patch).eq("id", id);
      if (ue) return res.status(500).json({ error: ue.message });
    }

    if (body.choices) {
      await supabaseAdmin.from("question_choices").delete().eq("question_id", id);
      const rows = body.choices.map((c, idx) => ({
        question_id: id,
        content: c.content,
        is_correct: c.isCorrect,
        order_index: idx,
      }));
      const { error: ie } = await supabaseAdmin.from("question_choices").insert(rows);
      if (ie) return res.status(500).json({ error: ie.message });
    }

    const loaded = await loadQuestion(id);
    if (loaded.error || !loaded.question) return res.status(404).json({ error: "Not found" });
    return res.json({ message: "Question updated", question: loaded.question });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid input" });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete
router.delete("/:id", authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("questions").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: "Question deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
