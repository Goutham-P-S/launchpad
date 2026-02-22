import axios from "axios";

const API_BASE = "http://localhost:5050";

export async function startOrchestration(prompt: string) {
  const res = await axios.post(`${API_BASE}/orchestrate`, { prompt });
  return res.data.jobId as string;
}

export async function cancelJob(jobId: string) {
  await axios.post(`${API_BASE}/jobs/${jobId}/cancel`);
}

export async function fetchStartups() {
  const res = await axios.get(`${API_BASE}/startups`);
  return res.data as StartupRecord[];
}

export async function fetchStartup(sandboxName: string) {
  const res = await axios.get(`${API_BASE}/startups/${sandboxName}`);
  return res.data as StartupRecord;
}

export async function startContainersApi(sandboxName: string) {
  const res = await axios.post(`${API_BASE}/startups/${sandboxName}/up`);
  return res.data;
}

export async function stopContainersApi(sandboxName: string) {
  const res = await axios.post(`${API_BASE}/startups/${sandboxName}/down`);
  return res.data;
}

export async function patchStartupStatus(sandboxName: string, status: string) {
  const res = await axios.patch(`${API_BASE}/startups/${sandboxName}/status`, { status });
  return res.data;
}

export interface SandboxPorts {
  webPort: number;
  dbPort: number;
  n8nPort: number;
}

export interface StartupRecord {
  startupId: number;
  slug: string;
  sandboxName: string;
  sandboxPath: string;
  ports: SandboxPorts;
  createdAt: string;
  status: "idle" | "building" | "running" | "stopped";
  jobId?: string;
  versions: {
    infra: string;
    planner: string;
    workflowIR: string;
    builder: string;
  };
}
