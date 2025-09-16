import { PrismaClient } from "@prisma/client";

// Declare global type for Prisma
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton instance of Prisma Client
export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma;
}

// Connect to the database
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
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.warn("⚠️ Prisma connection failed (continuing without Prisma):", (error as any)?.message || error);
  }
}

// Disconnect from the database
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// Gracefully shutdown database connection
process.on("beforeExit", async () => {
  try {
    await disconnectDatabase();
  } catch {}
});
