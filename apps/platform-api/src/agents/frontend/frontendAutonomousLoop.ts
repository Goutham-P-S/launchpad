import { planFrontendPages, enrichPageComponents } from "./frontendPlanner";
import { validateFrontendIR } from "./frontendValidator";
import { compileFrontend } from "./frontendCompiler";
import { runPlaywrightTests } from "./frontendTester";
import { runCommand } from "../../orchestrator/runCommand";

export async function runFrontendAutonomousLoop(
  params: {
    backendPlan: any;
    sandboxPath: string;
    jobId: string;
  }
) {

  const webPath = `${params.sandboxPath}/web`;
  await runCommand(
    params.jobId,
    "npx",
    ["playwright", "install", "--with-deps"],
    webPath
    );
  let attempts = 0;
  const maxAttempts = 3;

  let ir = await planFrontendPages(params.backendPlan);

  while (attempts < maxAttempts) {

    for (const page of ir.pages) {
      page.components = await enrichPageComponents(page);
    }

    validateFrontendIR(ir, params.backendPlan);

    compileFrontend(webPath, ir);

    try {
      await runCommand(params.jobId, "npm", ["run", "build"], webPath);
    } catch (err: any) {
      ir = await replan(ir, err.message);
      attempts++;
      continue;
    }
    
    const preview = runCommand(
    params.jobId,
    "npm",
    ["run", "preview"],
    webPath
    );

    // wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    const testResult = await runPlaywrightTests(params.jobId, webPath);
        if (!testResult.success) {

        const error = testResult.error || "";

        // Infra error → do NOT replan
        if (
            error.includes("playwright install") ||
            error.includes("Executable doesn't exist")
        ) {
            console.log("⚠️ Playwright infra error. Installing browsers...");
            await runCommand(params.jobId, "npx", ["playwright", "install"], webPath);
            continue;
        }

  // Real UI failure → replan
  ir = await replan(ir, error);
  attempts++;
  continue;
}


    console.log("✅ Frontend generation successful");
    return;
  }

  throw new Error("Frontend autonomous loop failed after retries");
}

function extractJSON(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON found in replan output");
  }

  return JSON.parse(match[0]);
}

async function replan(ir: any, error: string) {
  const { llamaChat } = await import("../llamaClient");

  const system = `
You are a frontend repair agent.

STRICT RULES:
- Only output JSON.
- Must return full FrontendIR object.
- Must contain "pages" array.
- Do not include explanations.
`;

  const response = await llamaChat({
    system,
    user: JSON.stringify({ ir, error }),
    temperature: 0
  });

  const parsed = extractJSON(response);

  if (!Array.isArray(parsed.pages)) {
    throw new Error("Replanned IR missing pages array");
  }

  return parsed;
}

