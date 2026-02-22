const fs = require('fs');
const file = 'c:/Users/goutham/Documents/Main Project/final_yr_proj/apps/platform-api/src/agents/frontend/generateEcommerceFrontend.ts';
let code = fs.readFileSync(file, 'utf8');

// Using split and join to bypass regex escaping issues
code = code.split('\\${frontendConfig').join('${frontendConfig');

fs.writeFileSync(file, code);
console.log('Fixed escaping via split/join.');
