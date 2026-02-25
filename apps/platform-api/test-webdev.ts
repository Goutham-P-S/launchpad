import path from "path";
import { runWebDevAgent } from "./src/agents/webdev/runWebDevAgent";

async function main() {
    console.log("=== Testing Minimalist Dev Blog ===");
    await runWebDevAgent({
        startupId: 998,
        sandboxPath: path.join(process.cwd(), "data", "startups", "test-blog"),
        requirement: "A Minimalist Dev Blog about React and Node.js",
        jobId: "job-blog"
    });

    console.log("\n=== Testing B2B SaaS ===");
    await runWebDevAgent({
        startupId: 999,
        sandboxPath: path.join(process.cwd(), "data", "startups", "test-saas"),
        requirement: "A B2B SaaS for syncing data between CRM platforms.",
        jobId: "job-saas"
    });

    console.log("\n✅ All tests passed!");
}

main().catch(console.error);
