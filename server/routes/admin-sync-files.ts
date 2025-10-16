import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = Router();

interface FileMatch {
  presentationId: string;
  presentationTitle: string;
  pdfFile?: string;
  pptFile?: string;
  existingPdfPath?: string;
  existingPptPath?: string;
}

// GET /api/admin/sync-files/preview - Preview what will be synced (read-only)
router.get("/preview", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    // Get all presentations
    const { data: presentations, error: presErr } = await supabaseAdmin
      .from("presentations")
      .select("id, title, pdf_path, ppt_path");

    if (presErr || !presentations) {
      return res.status(500).json({ error: presErr?.message || "Failed to fetch presentations" });
    }

    // List all files in presentations bucket
    const { data: files, error: filesErr } = await supabaseAdmin.storage
      .from("presentations")
      .list("", { limit: 1000 });

    if (filesErr || !files) {
      return res.status(500).json({ error: filesErr?.message || "Failed to list bucket files" });
    }

    // Parse filenames to match with presentations
    const matches: FileMatch[] = [];
    const filesByPresentation: { [key: string]: { pdfs: string[]; ppts: string[] } } = {};

    // Group files by presentation ID
    for (const file of files) {
      if (file.name === ".emptyFolderPlaceholder") continue;

      // Files typically named like: "{presentation-id}-something.pdf" or "{presentation-id}-something.ppt"
      const match = file.name.match(/^([a-z0-9]+)[-_](.+)\.(pdf|pptx?)$/i);
      if (match) {
        const [, presId, , ext] = match;
        if (!filesByPresentation[presId]) {
          filesByPresentation[presId] = { pdfs: [], ppts: [] };
        }
        if (ext.toLowerCase() === "pdf") {
          filesByPresentation[presId].pdfs.push(file.name);
        } else if (ext.toLowerCase().match(/^ppt/)) {
          filesByPresentation[presId].ppts.push(file.name);
        }
      }
    }

    // Build matches list with current state
    for (const pres of presentations) {
      const presId = pres.id;
      const groupedFiles = filesByPresentation[presId];

      if (groupedFiles) {
        matches.push({
          presentationId: presId,
          presentationTitle: pres.title,
          pdfFile: groupedFiles.pdfs[0],
          pptFile: groupedFiles.ppts[0],
          existingPdfPath: pres.pdf_path,
          existingPptPath: pres.ppt_path,
        });
      }
    }

    const updates = matches.filter(
      (m) =>
        (m.pdfFile && m.pdfFile !== m.existingPdfPath) ||
        (m.pptFile && m.pptFile !== m.existingPptPath)
    );

    return res.json({
      totalPresentations: presentations.length,
      totalBucketFiles: files.length,
      matchedPresentations: matches.length,
      matchesToUpdate: updates.length,
      matches,
      updates,
    });
  } catch (err: any) {
    console.error("[admin-sync-files] preview error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// POST /api/admin/sync-files/execute - Actually perform the sync
router.post("/execute", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    // Get all presentations
    const { data: presentations, error: presErr } = await supabaseAdmin
      .from("presentations")
      .select("id, title, pdf_path, ppt_path");

    if (presErr || !presentations) {
      return res.status(500).json({ error: presErr?.message || "Failed to fetch presentations" });
    }

    // List all files in presentations bucket
    const { data: files, error: filesErr } = await supabaseAdmin.storage
      .from("presentations")
      .list("", { limit: 1000 });

    if (filesErr || !files) {
      return res.status(500).json({ error: filesErr?.message || "Failed to list bucket files" });
    }

    // Parse filenames and group by presentation
    const filesByPresentation: { [key: string]: { pdfs: string[]; ppts: string[] } } = {};

    for (const file of files) {
      if (file.name === ".emptyFolderPlaceholder") continue;

      const match = file.name.match(/^([a-z0-9]+)[-_](.+)\.(pdf|pptx?)$/i);
      if (match) {
        const [, presId, , ext] = match;
        if (!filesByPresentation[presId]) {
          filesByPresentation[presId] = { pdfs: [], ppts: [] };
        }
        if (ext.toLowerCase() === "pdf") {
          filesByPresentation[presId].pdfs.push(file.name);
        } else if (ext.toLowerCase().match(/^ppt/)) {
          filesByPresentation[presId].ppts.push(file.name);
        }
      }
    }

    // Update presentations with file paths
    const results: Array<{
      id: string;
      title: string;
      updated: boolean;
      changes: { pdf_path?: string; ppt_path?: string };
      error?: string;
    }> = [];

    for (const pres of presentations) {
      const files = filesByPresentation[pres.id];
      const changes: any = {};
      let updated = false;

      if (files?.pdfs.length) {
        const newPdfPath = files.pdfs[0];
        if (newPdfPath !== pres.pdf_path) {
          changes.pdf_path = newPdfPath;
          updated = true;
        }
      }

      if (files?.ppts.length) {
        const newPptPath = files.ppts[0];
        if (newPptPath !== pres.ppt_path) {
          changes.ppt_path = newPptPath;
          updated = true;
        }
      }

      if (updated) {
        const { error: upErr } = await supabaseAdmin
          .from("presentations")
          .update(changes)
          .eq("id", pres.id);

        results.push({
          id: pres.id,
          title: pres.title,
          updated: !upErr,
          changes,
          error: upErr?.message,
        });
      } else {
        results.push({
          id: pres.id,
          title: pres.title,
          updated: false,
          changes: {},
        });
      }
    }

    const successful = results.filter((r) => r.updated || (!r.updated && !r.error)).length;
    const failed = results.filter((r) => r.error).length;

    console.log("[admin-sync-files] sync completed", {
      total: results.length,
      successful,
      failed,
    });

    return res.json({
      success: true,
      totalPresentations: results.length,
      successfulUpdates: successful,
      failedUpdates: failed,
      results,
    });
  } catch (err: any) {
    console.error("[admin-sync-files] execute error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

export default router;
