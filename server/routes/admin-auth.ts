import express, { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../lib/supabase";
import {
  authenticateAdminToken,
  AdminAuthRequest,
} from "../middleware/adminAuth";

const router = express.Router();

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{3,32}$/),
  password: z.string().min(6),
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const { data: user, error } = await supabaseAdmin
      .from("app_users")
      .select(
        "id, username, password_hash, role, is_active, created_at, updated_at, last_login_at",
      )
      .ilike("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "User is deactivated" });
    }

    if (!user.password_hash || typeof user.password_hash !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "";
    if (!secret) throw new Error("JWT_SECRET not configured");

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    // Update last_login_at (non-blocking)
    void (async () => {
      try {
        await supabaseAdmin
          .from("app_users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch (_) {}
    })();

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/me",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { data: user, error } = await supabaseAdmin
        .from("app_users")
        .select(
          "id, username, role, is_active, created_at, updated_at, last_login_at",
        )
        .eq("id", req.adminUser!.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ user });
    } catch (err) {
      console.error("Get admin profile error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Change own password
router.post(
  "/change-password",
  authenticateAdminToken,
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const schema = z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      });
      const { currentPassword, newPassword } = schema.parse(req.body);

      const { data: user, error } = await supabaseAdmin
        .from("app_users")
        .select("id, password_hash")
        .eq("id", req.adminUser!.id)
        .single();
      if (error || !user)
        return res.status(404).json({ error: "User not found" });

      if (
        !user.password_hash ||
        !(await bcrypt.compare(currentPassword, user.password_hash))
      ) {
        return res.status(401).json({ error: "Current password incorrect" });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      const { error: upErr } = await supabaseAdmin
        .from("app_users")
        .update({ password_hash })
        .eq("id", req.adminUser!.id);
      if (upErr) return res.status(500).json({ error: upErr.message });

      return res.json({ message: "Password updated" });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Invalid input" });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
