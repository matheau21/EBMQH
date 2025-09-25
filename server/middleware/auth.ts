import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/database";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: "ADMIN" | "END_USER";
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // If Prisma isn't configured (production serverless), short-circuit with 503 for user endpoints
  if (!prisma || typeof (prisma as any).$queryRaw === "undefined") {
    return res.status(503).json({ error: "Database not configured for this deployment" });
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as any;

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        userType: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.userType !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};
