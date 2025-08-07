import { PrismaClient } from '@prisma/client';

// Declare global type for Prisma
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton instance of Prisma Client
export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Connect to the database
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Disconnect from the database
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// Gracefully shutdown database connection
process.on('beforeExit', async () => {
  await disconnectDatabase();
});
