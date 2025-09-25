import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/database.js";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// Ensure Prisma is available; otherwise return a friendly error for all /api/users endpoints
router.use((_, res, next) => {
  const ready = !!(prisma && typeof (prisma as any).$queryRaw !== "undefined");
  if (!ready) return res.status(503).json({ error: "Database not configured for this deployment" });
  next();
});

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userType: z.enum(["ADMIN", "END_USER"]).optional().default("END_USER"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userType: z.enum(["ADMIN", "END_USER"]).optional(),
});

// POST /api/users/register - Register a new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName, userType } =
      registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        userType,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        userType: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "", {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/login - Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "", {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me - Get current user profile
router.get(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /api/users/me - Update current user profile
router.put(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const updates = updateUserSchema.parse(req.body);

      // Check if email/username already exists (if being updated)
      if (updates.email || updates.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: req.user!.id } },
              {
                OR: [
                  updates.email ? { email: updates.email } : {},
                  updates.username ? { username: updates.username } : {},
                ].filter((condition) => Object.keys(condition).length > 0),
              },
            ],
          },
        });

        if (existingUser) {
          return res.status(400).json({
            error: "Email or username already in use",
          });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: updates,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          userType: true,
          updatedAt: true,
        },
      });

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/users - Get all users (Admin only)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = "1", limit = "10", userType } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where = userType
        ? { userType: userType as "ADMIN" | "END_USER" }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            userType: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/users/:id - Get user by ID (Admin only)
router.get(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
          presentations: {
            select: {
              id: true,
              title: true,
              specialty: true,
              viewerCount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /api/users/:id - Update user by ID (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = updateUserSchema.parse(req.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if email/username already exists (if being updated)
      if (updates.email || updates.username) {
        const conflictUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  updates.email ? { email: updates.email } : {},
                  updates.username ? { username: updates.username } : {},
                ].filter((condition) => Object.keys(condition).length > 0),
              },
            ],
          },
        });

        if (conflictUser) {
          return res.status(400).json({
            error: "Email or username already in use",
          });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          userType: true,
          updatedAt: true,
        },
      });

      res.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// DELETE /api/users/:id - Delete user by ID (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deleting the last admin
      if (existingUser.userType === "ADMIN") {
        const adminCount = await prisma.user.count({
          where: { userType: "ADMIN" },
        });

        if (adminCount <= 1) {
          return res.status(400).json({
            error: "Cannot delete the last admin user",
          });
        }
      }

      await prisma.user.delete({
        where: { id },
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
