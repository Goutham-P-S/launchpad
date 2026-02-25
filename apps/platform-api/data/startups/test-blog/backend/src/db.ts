
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected");
  } catch (err) {
    console.error("❌ Prisma connection failed", err);
    process.exit(1);
  }
}
