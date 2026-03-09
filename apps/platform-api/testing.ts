import { runWebImprovementAgent } from "./src/agents/webdev/runWebImprovementAgent";

const sandboxDir = "c:/Users/goutham/Documents/Main Project/final_yr_proj/sandboxes/startup-0006-e-commerce-for-hand-crafted-go/infra-v1__planner-v1__ir-v1__builder-v1";

runWebImprovementAgent({
    sandboxPath: sandboxDir,
    requirement: "change the brand header Login button text to say Seller",
    jobId: "test-job-local"
}).then(() => console.log("DONE"))
    .catch(console.error);
