import express, { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/database.js";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// Validation schemas
const createPresentationSchema = z.object({
  title: z.string().min(1).max(500),
  specialty: z.string().min(1),
  summary: z.string().min(1),
  authors: z.string().optional(),
  journal: z.string().optional(),
  year: z.string().optional(),
  thumbnail: z.string().optional(),
  presentationFileUrl: z.string().optional(),
  originalArticleUrl: z.string().optional(),
});

const updatePresentationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  specialty: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  authors: z.string().optional(),
  journal: z.string().optional(),
  year: z.string().optional(),
  thumbnail: z.string().optional(),
  presentationFileUrl: z.string().optional(),
  originalArticleUrl: z.string().optional(),
});

// GET /api/presentations - Get all presentations
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      specialty,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where: any = {};

    if (specialty) {
      where.specialty = specialty;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { summary: { contains: search as string, mode: "insensitive" } },
        { authors: { contains: search as string, mode: "insensitive" } },
        { journal: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [presentations, total] = await Promise.all([
      prisma.presentation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy,
      }),
      prisma.presentation.count({ where }),
    ]);

    res.json({
      presentations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get presentations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/specialties - Get all unique specialties
router.get("/specialties", async (req: Request, res: Response) => {
  try {
    const specialties = await prisma.presentation.findMany({
      select: {
        specialty: true,
      },
      distinct: ["specialty"],
      orderBy: {
        specialty: "asc",
      },
    });

    const specialtyList = specialties.map((p) => p.specialty);
    res.json({ specialties: specialtyList });
  } catch (error) {
    console.error("Get specialties error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/:id - Get presentation by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const presentation = await prisma.presentation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!presentation) {
      return res.status(404).json({ error: "Presentation not found" });
    }

    // Increment view count
    await prisma.presentation.update({
      where: { id },
      data: { viewerCount: { increment: 1 } },
    });

    res.json({ presentation });
  } catch (error) {
    console.error("Get presentation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/presentations - Create new presentation (Admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const data = createPresentationSchema.parse(req.body);

      const presentation = await prisma.presentation.create({
        data: {
          ...data,
          createdBy: req.user!.id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json({
        message: "Presentation created successfully",
        presentation,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create presentation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PUT /api/presentations/:id - Update presentation (Admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = updatePresentationSchema.parse(req.body);

      // Check if presentation exists
      const existingPresentation = await prisma.presentation.findUnique({
        where: { id },
      });

      if (!existingPresentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }

      const presentation = await prisma.presentation.update({
        where: { id },
        data: updates,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json({
        message: "Presentation updated successfully",
        presentation,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Update presentation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// DELETE /api/presentations/:id - Delete presentation (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Check if presentation exists
      const existingPresentation = await prisma.presentation.findUnique({
        where: { id },
      });

      if (!existingPresentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }

      await prisma.presentation.delete({
        where: { id },
      });

      res.json({ message: "Presentation deleted successfully" });
    } catch (error) {
      console.error("Delete presentation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/presentations/:id/view - Increment view count
router.post("/:id/view", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const presentation = await prisma.presentation.update({
      where: { id },
      data: { viewerCount: { increment: 1 } },
      select: { viewerCount: true },
    });

    res.json({ viewerCount: presentation.viewerCount });
  } catch (error) {
    console.error("Increment view count error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/presentations/stats/overview - Get presentation statistics (Admin only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const [
        totalPresentations,
        totalViews,
        specialtyStats,
        recentPresentations,
      ] = await Promise.all([
        prisma.presentation.count(),
        prisma.presentation.aggregate({
          _sum: { viewerCount: true },
        }),
        prisma.presentation.groupBy({
          by: ["specialty"],
          _count: { specialty: true },
          orderBy: { _count: { specialty: "desc" } },
        }),
        prisma.presentation.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            specialty: true,
            viewerCount: true,
            createdAt: true,
          },
        }),
      ]);

      const stats = {
        totalPresentations,
        totalViews: totalViews._sum.viewerCount || 0,
        specialtyDistribution: specialtyStats.map((stat) => ({
          specialty: stat.specialty,
          count: stat._count.specialty,
        })),
        recentPresentations,
      };

      res.json(stats);
    } catch (error) {
      console.error("Get presentation stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
