import path from "path";
import fs from "fs";

import { planBackendArchitecture } from "./backendPlanner";
import { generatePrismaSchema } from "./prismaGenerator";
import { generateCrudForEntity } from "./crudGenerator";
import { generateBackendScaffold } from "./backendScaffoldGenerator";
import { runCommand } from "../../orchestrator/runCommand";
import { writeBackendEnv } from "../../backendEnvGenerator";
import { generateEcommerceFrontend } from "../frontend/generateEcommerceFrontend";
import { planEcommerceFrontend } from "../frontend/ecommerceFrontendPlanner";

function injectAuthModels(schema: string) {
  const authModels = `
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  roles     UserRole[]
  createdAt DateTime @default(now())
}

model Role {
  id    Int        @id @default(autoincrement())
  name  String     @unique
  users UserRole[]
}

model UserRole {
  userId Int
  roleId Int

  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])

  @@id([userId, roleId])
}
`;

  return schema + "\n" + authModels;
}

export async function runWebDevAgent(params: {
  startupId: number;
  sandboxPath: string;
  requirement: string;
  jobId: string;
}) {
  console.log("🧠 Web Dev Agent starting...");

  const backendPath = path.join(params.sandboxPath, "backend");
  const webPath = path.join(params.sandboxPath, "web");
  //
  // 1️⃣ Plan backend (already normalized inside planner)
  //
  const plan = await planBackendArchitecture(params.requirement);

  //
  // 2️⃣ Generate Prisma schema
  //
  let prismaSchema = generatePrismaSchema(plan);
  prismaSchema = injectAuthModels(prismaSchema);

  //
  // 3️⃣ Remove old backend completely
  //
  if (fs.existsSync(backendPath)) {
    fs.rmSync(backendPath, { recursive: true, force: true });
  }

  //
  // 4️⃣ Generate backend scaffold
  //
  generateBackendScaffold(backendPath, prismaSchema);
  writeBackendEnv({
    backendPath,
    dbUser: "startup",
    dbPass: "startup",
    dbName: "startupdb",
  });
  //
  // 5️⃣ Generate CRUD per entity
  //
  for (const entity of plan.entities) {
    generateCrudForEntity(backendPath, entity);
  }

  // 6️⃣ Install dependencies
  //
  console.log("🔥 BEFORE INSTALL");

  await runCommand(
    params.jobId,
    "npm",
    ["install"],
    backendPath
  );

  console.log("🔥 AFTER INSTALL");
  console.log("✅ Backend fully generated with migrations");



  if (fs.existsSync(webPath)) {
    fs.rmSync(webPath, { recursive: true, force: true });
  }

  //
  // 8️⃣ Generate E-Commerce Frontend Template
  //
  const frontendConfig = await planEcommerceFrontend(params.requirement);
  generateEcommerceFrontend(webPath, plan, frontendConfig);

  //
  // 9️⃣ Install frontend deps
  //
  await runCommand(params.jobId, "npm", ["install"], webPath);

  //
  // 🔟 Build frontend 
  //
  await runCommand(params.jobId, "npm", ["run", "build"], webPath);

  console.log("✅ Full stack generated successfully");

  return plan;
}

