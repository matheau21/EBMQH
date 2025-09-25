// Lazy Prisma loader to avoid importing @prisma/client in serverless/production where it's unused
// This prevents function crashes when Prisma engines are not available
export let prisma: any = undefined;

// Connect to the database in development (or when DATABASE_URL is explicitly configured locally)
export async function connectDatabase() {
  const isProd = process.env.NODE_ENV === "production";
  const hasUrl = !!process.env.DATABASE_URL;

  if (isProd || !hasUrl) {
    try {
      console.log("Prisma connection skipped", { isProd, hasUrl });
    } catch {}
    return;
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.warn(
      "⚠️ Prisma connection failed (continuing without Prisma):",
      (error as any)?.message || error,
    );
  }
}

// Disconnect from the database
export async function disconnectDatabase() {
  if (prisma && typeof prisma.$disconnect === "function") {
    try {
      await prisma.$disconnect();
    } catch {}
  }
}

// Gracefully shutdown database connection
process.on("beforeExit", async () => {
  try {
    await disconnectDatabase();
  } catch {}
});
