import { planEcommerceFrontend } from "./src/agents/frontend/ecommerceFrontendPlanner";
import { generateEcommerceFrontend } from "./src/agents/frontend/generateEcommerceFrontend";

async function run() {
    console.log("------- TEST 1: BRUTALIST STREETWEAR -------");
    const req1 = "A brutalist, edgy streetwear brand named 'Concrete Jungle', focusing on oversized silhouettes and heavy typography. Very harsh lines.";
    const config1 = await planEcommerceFrontend(req1);
    console.dir(config1, { depth: null });

    console.log("\n------- TEST 2: ELEGANT JEWELRY -------");
    const req2 = "An elegant, soft, high-end fine jewelry boutique named 'Aura', specializing in delicate gold pieces. Very feminine, soft curves, floating elements.";
    const config2 = await planEcommerceFrontend(req2);
    console.dir(config2, { depth: null });

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

    // Generate output into test folders
    console.log("Generating Brutalist web folder...");
    generateEcommerceFrontend("C:\\\\Users\\\\goutham\\\\Documents\\\\Main Project\\\\final_yr_proj\\\\sandboxes\\\\test-brutalist\\\\web", plan, config1);

    console.log("Generating Elegant web folder...");
    generateEcommerceFrontend("C:\\\\Users\\\\goutham\\\\Documents\\\\Main Project\\\\final_yr_proj\\\\sandboxes\\\\test-elegant\\\\web", plan, config2);

    console.log("\nTEST GENERATION COMPLETE - VERIFY TAILWIND COLORS AND REACT COMPONENTS IN THE TWO WEB FOLDERS");
}

run().catch(console.error);
