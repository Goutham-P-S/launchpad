import { llamaChat } from "../../../agents/llamaClient";
import { Planner } from "../../contracts";
import { IRv1 } from "../../ir/v1.types";

function extractJSON(text: string) {
  // Gracefully handle LLMs that split flows into multiple markdown blocks
  const blocks = Array.from(text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g));
  if (blocks.length > 0) {
    try {
      const irs = blocks.map(b => JSON.parse(b[1].trim()));
      const mergedFlows = irs.flatMap(ir => ir.flows || []);
      if (mergedFlows.length > 0) {
        return { kind: "workflow", version: "v1", flows: mergedFlows };
      }
    } catch (e) {
      console.error("Failed to parse individual blocks, falling back...", e);
    }
  }

  // Fallback greedy matcher
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const match = cleaned.match(/{[\s\S]*}/);
  if (!match) throw new Error("No valid JSON found in LLM output");
  return JSON.parse(match[0]);
}

const planner: Planner = {
  async plan({ requirement, context }) {
    const startupId = context.startupId;
    const sandboxName = context.sandboxName;
    const backendPlan = context.backendPlan; // The orchestrated backend schema

    const integrations = context.integrations;
    const hasEmail = !!integrations?.email;
    const hasWhatsapp = !!integrations?.whatsapp;

    const system = `
You are an n8n workflow architect.
Your goal is to design a set of background automation flows for a new e-commerce startup.

AVAILABLE BACKEND ENDPOINTS:
${JSON.stringify(backendPlan?.entities?.map((e: any) => ({
      name: e.name,
      route: "/api/" + (e.name.toLowerCase().endsWith('s') ? e.name.toLowerCase() : e.name.toLowerCase() + 's')
    })), null, 2)}

INTEGRATIONS AVAILABLE:
- Email (SendGrid): ${hasEmail ? "ENABLED" : "DISABLED"}
- WhatsApp (Twilio): ${hasWhatsapp ? "ENABLED" : "DISABLED"}

STRICT RULES:
1. ONLY output JSON. Please output ALL flows inside ONE single JSON block. Do not split into multiple markdown blocks.
2. The JSON must exactly match the IRv1 format.
3. If a 'Feedback' or 'Review' entity exists, create a cron flow (every 60 mins) to analyze it with 'llm-analysis' and sink it to 'platform-api' at "/startups/${sandboxName}/suggestions".
4. If an entity like 'Order', 'Product', 'User', or 'Customer' exists, AND integrations are enabled, create a Real-Time Webhook flow for it!
   - trigger.type MUST be "webhook"
   - trigger.webhookPath MUST be "<model_lowercase>-created" (e.g. "product-created")
   - The sink MUST be "email" or "whatsapp" depending on available integrations.
   - Do NOT use cron for notifications if integrations are enabled; use webhook triggers.

IRv1 Format:
{
  "kind": "workflow",
  "version": "v1",
  "flows": [
    {
      "name": "Flow Name",
      "trigger": { "type": "cron" | "webhook", "everyMinutes": 60, "webhookPath": "product-created" },
      "source": { "type": "http", "path": "/api/feedbacks" }, // Omit source if trigger is webhook (webhook payload provides data)
      "action": { 
        "type": "llm-analysis" | "notification",
        "instruction": "Prompt for LLM or email message template"
      },
      "sink": { "type": "platform-api" | "mock-email" | "email" | "whatsapp", "path": "/startups/..." }
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

      // Inject API keys into parsed IR specifically for target sinks
      if (ir.flows) {
        ir.flows.forEach((flow: any) => {
          if (flow.sink && integrations) {
            flow.sink.integrations = integrations;
          }
        });
      }

      return ir;
    } catch (err) {
      console.error("Failed to parse n8n IR, falling back to basic template");
      try {
        require('fs').writeFileSync('llm-n8n-parsing-error.log', "Error: " + err + "\n\nRaw LLM response:\n" + response);
      } catch (e) { }

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
