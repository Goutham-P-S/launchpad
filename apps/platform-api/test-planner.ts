import { planBackendArchitecture } from "./src/agents/webdev/backendPlanner";
import { generatePrismaSchema } from "./src/agents/webdev/prismaGenerator";
import { runWebDevAgent } from "./src/agents/webdev/runWebDevAgent";

async function main() {
    const requirement = "Create a saas analytics dashboard";
    console.log("Requirement:", requirement);
    const plan = await planBackendArchitecture(requirement);
    console.log("=== PLAN ===");
    console.dir(plan, { depth: null });
    const schema = generatePrismaSchema(plan);
    console.log("=== SCHEMA ===");
    console.log(schema);
}

main().catch(console.error);
