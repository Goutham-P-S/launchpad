export type IRv1 = {
  kind: "workflow";
  version: "v1";
  flows: Array<{
    name: string;
    trigger: {
      type: "cron";
      everyMinutes: number;
    };
    source: {
      type: "http";
      path: string; // internal web API path
    };
    action: {
      type: "llm-analysis" | "notification";
      instruction: string; // prompt or message template
    };
    sink: {
      type: "platform-api" | "mock-email";
      path?: string; // platform API path
    };
  }>;
};
