import { runCommand } from "../../orchestrator/runCommand";

export async function runPlaywrightTests(
  jobId: string,
  webPath: string
) {
  try {
    await runCommand(jobId, "npx", ["playwright", "test"], webPath);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
