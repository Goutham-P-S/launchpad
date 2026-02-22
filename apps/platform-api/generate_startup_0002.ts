import { generateEcommerceFrontend } from "./src/agents/frontend/generateEcommerceFrontend";

const plan = {
    entities: [
        { name: "Customer" },
        { name: "Product" },
        { name: "Order" },
        { name: "OrderItem" }
    ]
};

const targetWebPath = "C:\\Users\\goutham\\Documents\\Main Project\\final_yr_proj\\sandboxes\\startup-0002-e-commerce-for-hand-crafted-go\\infra-v1__planner-v1__ir-v1__builder-v1\\web";

console.log(`Generating E-Commerce Frontend template to: ${targetWebPath}`);
generateEcommerceFrontend(targetWebPath, plan);
console.log("Template generated successfully.");
