import { llamaChat } from "../../../agents/llamaClient";
import { Planner } from "../../contracts";
import { IRv1 } from "../../ir/v1.types";

function extractJSON(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/{[\s\S]*}/);

  if (!match) {
    throw new Error("No valid JSON found in LLM output");
  }

  return JSON.parse(match[0]);
}

const planner: Planner = {
  async plan({ requirement, context }) {
    const startupId = context.startupId;
    const sandboxName = context.sandboxName;
    const backendPlan = context.backendPlan; // The orchestrated backend schema

    const system = `
You are an n8n workflow architect.
Your goal is to design a set of background automation flows for a new e-commerce startup.

AVAILABLE BACKEND ENDPOINTS:
${JSON.stringify(backendPlan?.entities?.map((e: any) => ({
      name: e.name,
      route: "/api/" + (e.name.toLowerCase().endsWith('s') ? e.name.toLowerCase() : e.name.toLowerCase() + 's')
    })), null, 2)}

STRICT RULES:
1. ONLY output JSON.
2. The JSON must exactly match the IRv1 format.
3. Use 'cron' triggers for all flows.
4. If a 'Feedback' or 'Review' entity exists, create a flow to analyze it with 'llm-analysis' and sink it to 'platform-api' at "/startups/${sandboxName}/suggestions".
5. If 'Order', 'User', or 'Customer' entities exist, create notification flows with 'notification' action and 'mock-email' sink.

IRv1 Format:
{
  "kind": "workflow",
  "version": "v1",
  "flows": [
    {
      "name": "Flow Name",
      "trigger": { "type": "cron", "everyMinutes": 1 },
      "source": { "type": "http", "path": "/api/feedbacks" },
      "action": { 
        "type": "llm-analysis" | "notification",
        "instruction": "Prompt for LLM or email message template"
      },
      "sink": { "type": "platform-api" | "mock-email", "path": "/startups/..." }
    }
  ]
}
`;

    const response = await llamaChat({
      system,
      user: `Requirements: ${requirement}`,
      temperature: 0
    });

    try {
      const ir = extractJSON(response) as IRv1;
      return ir;
    } catch (err) {
      console.error("Failed to parse n8n IR, falling back to basic template");
      return {
        kind: "workflow",
        version: "v1",
        flows: [
          {
            name: "Default Feedback Analysis",
            trigger: { type: "cron", everyMinutes: 1 },
            source: { type: "http", path: "/api/feedbacks" },
            action: {
              type: "llm-analysis",
              instruction: "Summarize feedback and extract top problems."
            },
            sink: { type: "platform-api", path: `/startups/${sandboxName}/suggestions` }
          }
        ]
      };
    }
  },
};

export default planner;
