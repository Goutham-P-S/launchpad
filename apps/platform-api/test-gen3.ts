import { planEcommerceFrontend } from "./src/agents/frontend/ecommerceFrontendPlanner";
import { generateEcommerceFrontend } from "./src/agents/frontend/generateEcommerceFrontend";

async function run() {
    const requirement = "A rustic, natural, artisanal pottery and ceramics storefront named 'Earthy Mugs', specializing in handcrafted vases and minimalist mugs.";
    console.log("Generating config for: ", requirement);

    // 1. LLM plans the brand
    const frontendConfig = await planEcommerceFrontend(requirement);

    console.dir(frontendConfig, { depth: null });

    const plan = {
        entities: [
            {
                name: "Product",
                fields: [{ name: "name", type: "String", isId: false }],
                relations: []
            }
        ],
        enums: []
    };

    // 2. Generate
    generateEcommerceFrontend("C:\\\\Users\\\\goutham\\\\Documents\\\\Main Project\\\\final_yr_proj\\\\sandboxes\\\\startup-0001-e-commerce-for-hand-crafted-go\\\\infra-v1__planner-v1__ir-v1__builder-v1\\\\web", plan, frontendConfig);

    console.log("TEST GENERATION COMPLETE - VERIFY TAILWIND COLORS AND REACT COMPONENTS IN THE WEB FOLDER");
}

run().catch(console.error);
