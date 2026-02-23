import v1Planner from "./src/n8n/planner/v1";
import v1Builder from "./src/n8n/builder/v1";

async function test() {
    const requirement = "A luxury watch store. It should have a feedback system and I want to be notified by email when new orders are placed and when customers sign up.";
    const context = {
        startupId: 777,
        sandboxName: "test-n8n-multi",
        backendPlan: {
            entities: [
                { name: "Product", fields: [] },
                { name: "Order", fields: [] },
                { name: "Feedback", fields: [] },
                { name: "Customer", fields: [] }
            ]
        }
    };

    console.log("🚀 Planning n8n IR...");
    const ir = await v1Planner.plan({ requirement, context });
    console.dir(ir, { depth: null });

    console.log("\n🚀 Building n8n Workflow...");
    const workflow = v1Builder.build({
        startupId: 777,
        sandboxName: "test-n8n-multi",
        ir
    });

    console.log("\n✅ Workflow Nodes:");
    workflow.nodes.forEach((n: any) => {
        console.log(`- [${n.type}] ${n.name} (ID: ${n.id})`);
        if (n.type === "n8n-nodes-base.httpRequest") {
            console.log(`  URL: ${n.parameters.url}`);
        }
    });

    console.log("\n✅ Workflow Connections:");
    console.dir(workflow.connections, { depth: null });
}

test().catch(console.error);
