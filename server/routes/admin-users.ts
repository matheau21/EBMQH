import express, { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../lib/supabase";
import {
  authenticateAdminToken,
  AdminAuthRequest,
  requireAdminOrOwner,
} from "../middleware/adminAuth";

const router = express.Router();

const usernameSchema = z.string().regex(/^[A-Za-z0-9]{3,32}$/);
const roleSchema = z.enum(["owner", "admin", "user"]);

const createUserSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6),
  role: roleSchema.default("user"),
  is_active: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  password: z.string().min(6).optional(),
  role: roleSchema.optional(),
  is_active: z.boolean().optional(),
});

router.get(
  "/",
  authenticateAdminToken,
  requireAdminOrOwner,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("app_users")
        .select(
          "id, username, role, is_active, created_at, updated_at, last_login_at",
        )
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ users: data });
    } catch (err) {
      console.error("List users error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/",
  authenticateAdminToken,
  requireAdminOrOwner,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const body = createUserSchema.parse(req.body);

      if (req.adminUser!.role === "admin" && body.role === "owner") {
        return res.status(403).json({ error: "Admins cannot create owners" });
      }

      const { data: existing, error: existErr } = await supabaseAdmin
        .from("app_users")
        .select("id")
        .eq("username", body.username)
        .maybeSingle();

      if (existErr) return res.status(500).json({ error: existErr.message });
      if (existing)
        return res.status(400).json({ error: "Username already exists" });

      const password_hash = await bcrypt.hash(body.password, 10);

      const { data, error } = await supabaseAdmin
        .from("app_users")
        .insert({
          username: body.username,
          password_hash,
          role: body.role,
          is_active: body.is_active,
        })
        .select(
          "id, username, role, is_active, created_at, updated_at, last_login_at",
        )
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.status(201).json({ message: "User created", user: data });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      console.error("Create user error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.patch(
  "/:id",
  authenticateAdminToken,
  requireAdminOrOwner,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = updateUserSchema.parse(req.body);

      const { data: target, error: fetchErr } = await supabaseAdmin
        .from("app_users")
        .select("id, role")
        .eq("id", id)
        .single();

      if (fetchErr || !target)
        return res.status(404).json({ error: "User not found" });

      if (req.adminUser!.role === "admin" && target.role === "owner") {
        return res.status(403).json({ error: "Admins cannot modify owners" });
      }

      if (req.adminUser!.role === "admin" && updates.role === "owner") {
        return res
          .status(403)
          .json({ error: "Admins cannot assign owner role" });
      }

      const patch: any = {};
      if (updates.password)
        patch.password_hash = await bcrypt.hash(updates.password, 10);
      if (typeof updates.is_active === "boolean")
        patch.is_active = updates.is_active;
      if (updates.role) patch.role = updates.role;

      const { data, error } = await supabaseAdmin
        .from("app_users")
        .update(patch)
        .eq("id", id)
        .select(
          "id, username, role, is_active, created_at, updated_at, last_login_at",
        )
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ message: "User updated", user: data });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      console.error("Update user error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:id",
  authenticateAdminToken,
  requireAdminOrOwner,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const { data: target, error: fetchErr } = await supabaseAdmin
        .from("app_users")
        .select("id, role")
        .eq("id", id)
        .single();

      if (fetchErr || !target)
        return res.status(404).json({ error: "User not found" });

      if (req.adminUser!.role === "admin" && target.role === "owner") {
        return res.status(403).json({ error: "Admins cannot delete owners" });
      }

      const { error } = await supabaseAdmin
        .from("app_users")
        .delete()
        .eq("id", id);

      if (error) return res.status(500).json({ error: error.message });

      return res.json({ message: "User deleted" });
    } catch (err) {
      console.error("Delete user error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
