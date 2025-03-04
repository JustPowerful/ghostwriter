import { PrismaClient } from "@prisma/client";

interface Global {
  prisma: PrismaClient;
}

declare const global: Global;

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export { prisma as db };
