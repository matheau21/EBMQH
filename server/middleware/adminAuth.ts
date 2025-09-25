import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../lib/supabase";

export interface AdminAuthRequest extends Request {
  adminUser?: {
    id: string;
    username: string;
    role: "owner" | "admin" | "user";
    is_active: boolean;
  };
}

export const authenticateAdminToken = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && (authHeader as string).split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as any;

    const { data, error } = await supabaseAdmin
      .from("app_users")
      .select(
        "id, username, role, is_active, created_at, updated_at, last_login_at",
      )
      .eq("id", decoded.userId)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!data.is_active) {
      return res.status(403).json({ error: "User is deactivated" });
    }

    req.adminUser = {
      id: data.id,
      username: data.username,
      role: data.role as "owner" | "admin" | "user",
      is_active: data.is_active,
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireAdminOrOwner = (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.adminUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!(req.adminUser.role === "admin" || req.adminUser.role === "owner")) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
