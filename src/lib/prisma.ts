import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  keepAliveTimer: NodeJS.Timeout | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Eagerly connect and keep connection alive to prevent cold starts
if (!globalForPrisma.keepAliveTimer) {
  prisma.$connect().catch((err) => {
    console.warn('[Prisma] Warm-up warning:', err.message);
  });

  // Ping database every 2 minutes so Prisma Postgres serverless VM stays warm
  globalForPrisma.keepAliveTimer = setInterval(() => {
    prisma.$queryRaw`SELECT 1`.catch(() => {});
  }, 2 * 60 * 1000);
}
