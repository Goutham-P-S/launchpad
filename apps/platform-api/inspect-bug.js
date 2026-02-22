const fs = require('fs');
const path = require('path');

const webDir = 'c:/Users/goutham/Documents/Main Project/final_yr_proj/sandboxes/startup-0003-create-an-elegant-jewelry-sell/infra-v1__planner-v1__ir-v1__builder-v1/web/src/pages';
const files = ['HomePage.tsx', 'AdminPage.tsx'];

files.forEach(f => {
    const file = path.join(webDir, f);
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');

        // Since it's inside literal JS now, it might say \${frontendConfig
        // The generator resulted in literal string `\${frontendConfig...}`
        // BUT WAIT, the generator outputted exactly what the JS engine evaluated!
        // At the time, frontendConfig was undefined, so what DID the generator output?
        // It output: \${frontendConfig?.borderRadius === 'full' ? 'rounded-full' : 'rounded-theme'}
        // NO, the generator outputs what Node.js template strings output!
        console.log('Read: ', f);
        // Let's just fix it by matching \${frontendConfig...} and replacing.
        // Actually, since I don't want to parse regex, I'll just regenerate the frontend 
        // by pulling the state and plan JSON from the builder module?
        // Let's just read HomePage.tsx and print the lines to see what was actually generated!
        const lines = code.split('\\n');
        console.log(lines.find(l => l.includes('button className')));
    }
});
