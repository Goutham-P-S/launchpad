import { IRv1 } from "./ir/v1.types";

export function buildStartupWorkflowTemplate(params: {
  startupId: number;
  sandboxName: string;
  ir: IRv1;
  startupWebInternalUrl?: string; // default http://web:3000
}) {
  const {
    startupId,
    sandboxName,
    ir,
    startupWebInternalUrl = "http://web:3000",
  } = params;

  const nodes: any[] = [];
  const connections: any = {};

  ir.flows.forEach((flow, index) => {
    const flowId = flow.name.replace(/\s+/g, "_").toLowerCase();

    // 1. Trigger
    const triggerNode = {
      id: `${flowId}_trigger`,
      name: `${flow.name} Trigger`,
      type: "n8n-nodes-base.cron",
      typeVersion: 1,
      position: [250, index * 250 + 250],
      parameters: {
        rule: { interval: [{ field: "minutes", minutesInterval: flow.trigger.everyMinutes }] },
      },
    };

    // 2. HTTP Source
    const sourceNode = {
      id: `${flowId}_source`,
      name: `Fetch ${flow.name} Data`,
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4,
      position: [500, index * 250 + 250],
      parameters: {
        url: `${startupWebInternalUrl}${flow.source.path}`,
        method: "GET",
        responseFormat: "json",
      },
    };

    // 3. Logic Node
    let logicNode: any;
    let sinkNode: any;

    if (flow.action.type === "llm-analysis") {
      logicNode = {
        id: `${flowId}_logic`,
        name: `Analyze ${flow.name}`,
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [750, index * 250 + 250],
        parameters: {
          jsCode: `
const items = $input.all();
if (!items.length) {
  return [{ json: { sandboxName: "${sandboxName}", startupId: ${startupId}, prompt: "No data" } }];
}
const data = items.map(i => JSON.stringify(i.json)).join("\\n");
return [{
  json: {
    sandboxName: "${sandboxName}",
    startupId: ${startupId},
    prompt: "${flow.action.instruction.replace(/"/g, '\\"')}\\n\\nData:\\n" + data
  }
}];`.trim(),
        },
      };

      const ollamaNode = {
        id: `${flowId}_ollama`,
        name: `Ollama ${flow.name}`,
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4,
        position: [1000, index * 250 + 250],
        parameters: {
          url: "={{ $env.OLLAMA_URL }}",
          method: "POST",
          sendBody: true,
          specifyBody: "json",
          jsonBody: "={{ { model: 'llama3.1', prompt: $json.prompt, stream: false } }}",
        },
      };

      sinkNode = {
        id: `${flowId}_sink`,
        name: `Submit Suggestion`,
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4,
        position: [1250, index * 250 + 250],
        parameters: {
          url: `http://host.docker.internal:5050${flow.sink.path}`,
          method: "POST",
          sendBody: true,
          specifyBody: "json",
          jsonBody: `={
            "startupId": ${startupId},
            "sandboxName": "${sandboxName}",
            "analysis": {{$json.response.replaceSpecialChars().toJsonString()}}
          }`,
        },
      };

      nodes.push(triggerNode, sourceNode, logicNode, ollamaNode, sinkNode);
      connections[triggerNode.name] = { main: [[{ node: sourceNode.name, type: "main", index: 0 }]] };
      connections[sourceNode.name] = { main: [[{ node: logicNode.name, type: "main", index: 0 }]] };
      connections[logicNode.name] = { main: [[{ node: ollamaNode.name, type: "main", index: 0 }]] };
      connections[ollamaNode.name] = { main: [[{ node: sinkNode.name, type: "main", index: 0 }]] };

    } else {
      // Notification flow (e.g. Email Agent)
      logicNode = {
        id: `${flowId}_logic`,
        name: `Format ${flow.name}`,
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [750, index * 250 + 250],
        parameters: {
          jsCode: `
const items = $input.all();
return items.map(item => ({
  json: {
    message: "${flow.action.instruction.replace(/"/g, '\\"')}",
    data: item.json
  }
}));`.trim(),
        },
      };

      sinkNode = {
        id: `${flowId}_sink`,
        name: `Mock Email Agent`,
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [1000, index * 250 + 250],
        parameters: {
          jsCode: `
console.log("📧 SENDING EMAIL...");
console.log("To: admin@${sandboxName}.com");
console.log("Subject: ${flow.name} Notification");
console.log("Content: " + $json.message);
return [{ json: { status: "sent", to: "admin@${sandboxName}.com", content: $json.message } }];`.trim(),
        },
      };

      nodes.push(triggerNode, sourceNode, logicNode, sinkNode);
      connections[triggerNode.name] = { main: [[{ node: sourceNode.name, type: "main", index: 0 }]] };
      connections[sourceNode.name] = { main: [[{ node: logicNode.name, type: "main", index: 0 }]] };
      connections[logicNode.name] = { main: [[{ node: sinkNode.name, type: "main", index: 0 }]] };
    }
  });

  return {
    name: `Startup-${startupId} Managed Workflows`,
    active: true,
    nodes,
    connections,
    settings: {},
  };
}
