const fs = require('fs');
const path = require('path');

const webPath = "c:\\\\Users\\\\goutham\\\\Documents\\\\Main Project\\\\final_yr_proj\\\\sandboxes\\\\startup-0010-e-commerce-for-hand-crafted-go\\\\infra-v1__planner-v1__ir-v1__builder-v1\\\\web";
const outPath = "c:\\\\Users\\\\goutham\\\\Documents\\\\Main Project\\\\final_yr_proj\\\\apps\\\\platform-api\\\\src\\\\agents\\\\frontend\\\\generateEcommerceFrontend.ts";

function readDirRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('dist')) {
                results = results.concat(readDirRecursively(file));
            }
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = readDirRecursively(webPath);
let output = 'import fs from "fs";\n' +
    'import path from "path";\n\n' +
    'function writeFile(dir: string, file: string, content: string) {\n' +
    '  fs.mkdirSync(dir, { recursive: true });\n' +
    '  fs.writeFileSync(path.join(dir, file), content.trim() + "\\n");\n' +
    '}\n\n' +
    'export function generateEcommerceFrontend(webPath: string, backendPlan: any) {\n' +
    '  fs.mkdirSync(webPath, { recursive: true });\n\n' +
    '  const srcPath = path.join(webPath, "src");\n' +
    '  const pagesPath = path.join(srcPath, "pages");\n' +
    '  const componentsPath = path.join(srcPath, "components");\n' +
    '  const apiPath = path.join(srcPath, "api");\n' +
    '  const contextPath = path.join(srcPath, "context");\n\n' +
    '  const primaryEntity = backendPlan?.entities?.find((e: any) =>\n' +
    '    [\'product\', \'item\', \'listing\', \'good\', \'service\', \'craft\'].includes(e.name.toLowerCase())\n' +
    '  ) || backendPlan?.entities?.[0] || { name: "Product" };\n\n' +
    '  const entityName = primaryEntity.name;\n' +
    '  const lowerName = entityName.toLowerCase();\n' +
    '  const endpoint = `/${lowerName.endsWith(\'s\') ? lowerName : lowerName + \'s\'}`;\n\n';

files.forEach(file => {
    if (file.includes('node_modules') || file.includes('dist') || file.endsWith('package-lock.json') || file.endsWith('.lock') || file.endsWith('.log') || file.endsWith('.env')) return;
    const content = fs.readFileSync(file, 'utf8');
    let escaped = content.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\$/g, '\\$');

    if (file.endsWith('HomePage.tsx')) {
        escaped = escaped.replace(/api\.get\("\/products"\)/g, 'api.get("${endpoint}")');
    }

    let dirVar = 'webPath';
    const relPath = path.relative(webPath, file).replace(/\\/g, '/');
    const parsed = path.parse(relPath);

    if (relPath.startsWith('src/pages')) dirVar = 'pagesPath';
    else if (relPath.startsWith('src/components')) dirVar = 'componentsPath';
    else if (relPath.startsWith('src/context')) dirVar = 'contextPath';
    else if (relPath.startsWith('src/api')) dirVar = 'apiPath';
    else if (relPath.startsWith('src')) dirVar = 'srcPath';

    output += `  writeFile(${dirVar}, "${parsed.base}", \`\n${escaped}\n\`);\n\n`;
});

output += '  console.log("👗 Multi-page E-commerce Frontend scaffold generated successfully");\n}\n';

fs.writeFileSync(outPath, output);
console.log("Recovered generateEcommerceFrontend.ts");
