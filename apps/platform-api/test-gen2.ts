import { generateEcommerceFrontend } from "./src/agents/frontend/generateEcommerceFrontend";

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

generateEcommerceFrontend("C:\\\\Users\\\\goutham\\\\Documents\\\\Main Project\\\\final_yr_proj\\\\sandboxes\\\\startup-0001-e-commerce-for-hand-crafted-go\\\\infra-v1__planner-v1__ir-v1__builder-v1\\\\web", plan);

console.log("TEST GENERATION COMPLETE");
