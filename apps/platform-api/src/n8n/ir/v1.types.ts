export type IRv1 = {
  kind: "workflow";
  version: "v1";
  flows: Array<{
    name: string;
    trigger: {
      type: "cron" | "webhook";
      everyMinutes?: number;
      webhookPath?: string;
    };
    source?: {
      type: "http";
      path: string; // internal web API path
    };
    action: {
      type: "llm-analysis" | "notification";
      instruction: string; // prompt or message template
    };
    sink: {
      type: "platform-api" | "mock-email" | "email" | "whatsapp";
      path?: string; // platform API path
      integrations?: any; // To hold credentials injected from frontend
    };
  }>;
};
