
import { prisma } from "../db";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  const existingRoles = await prisma.role.count();

  if (existingRoles > 0) {
    console.log("🌱 Roles already seeded");
    return;
  }

  console.log("🌱 Seeding roles and admin user...");

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const adminRole = await prisma.role.create({
    data: { name: "admin" }
  });

  const userRole = await prisma.role.create({
    data: { name: "user" }
  });

  const hashed = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.create({
    data: {
      email,
      password: hashed
    }
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log("✅ Default admin created:");
  console.log("📧 Email:", email);
}
