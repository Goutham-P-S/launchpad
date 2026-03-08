import { Router } from "express";
import { randomUUID } from "crypto";
import { createJob } from "../jobs/jobStore";
import { runOrchestration } from "../orchestrator/orchestrateWorker";
import { enqueueJob } from "../queue/jobQueue";
const router = Router();

router.post("/", async (req, res) => {
  const { prompt, integrations } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  const jobId = randomUUID();

  createJob(jobId);

  enqueueJob(jobId, prompt, integrations);

  res.json({ jobId });
});

export default router;
