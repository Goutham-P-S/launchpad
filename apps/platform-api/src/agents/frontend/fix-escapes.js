import fs from 'fs';
import path from 'path';

const dir = "c:/Users/goutham/Documents/Main Project/final_yr_proj/apps/platform-api/src/agents/frontend";
const files = ["generateEcommerceFrontend.ts", "generateSaasFrontend.ts", "generateBlogFrontend.ts"];

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace \${frontendConfig with ${frontendConfig
    content = content.replace(/\\\$\{frontendConfig/g, '${frontendConfig');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed ${file}`);
}
