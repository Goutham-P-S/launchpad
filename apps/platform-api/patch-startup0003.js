const fs = require('fs');
const path = require('path');

const webDir = 'c:/Users/goutham/Documents/Main Project/final_yr_proj/sandboxes/startup-0003-create-an-elegant-jewelry-sell/infra-v1__planner-v1__ir-v1__builder-v1/web/src/pages';
['HomePage.tsx', 'AdminPage.tsx'].forEach(f => {
    const file = path.join(webDir, f);
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');

        // We know startup-0003 is elegant jewelry, so we'll enforce the exact CSS variables here.
        // Replace ${frontendConfig?.borderRadius === 'full' ? 'rounded-full' : 'rounded-theme'}
        // with rounded-3xl or rounded-full
        code = code.replace(/\$\{frontendConfig\?.borderRadius === 'full' \? 'rounded-3xl' : 'rounded-theme'\}/g, 'rounded-3xl');
        code = code.replace(/\$\{frontendConfig\?.borderRadius === 'full' \? 'rounded-2xl' : 'rounded-theme'\}/g, 'rounded-2xl');
        code = code.replace(/\$\{frontendConfig\?.borderRadius === 'full' \? 'rounded-full' : 'rounded-theme'\}/g, 'rounded-full');

        code = code.replace(/\$\{frontendConfig\?.buttonStyle === 'soft' \? 'shadow-lg' : frontendConfig\?.buttonStyle === 'outline' \? 'bg-transparent border-2 border-brand-600 text-brand-600 hover:text-white' : 'shadow-sm'\}/g, 'shadow-lg');
        code = code.replace(/\$\{frontendConfig\?.buttonStyle === 'soft' \? 'shadow-md' : 'shadow-sm'\}/g, 'shadow-md');
        code = code.replace(/\$\{frontendConfig\?.buttonStyle === 'soft' \? 'shadow-xl' : frontendConfig\?.buttonStyle === 'outline' \? 'bg-transparent border-2 border-gray-900 text-gray-900 hover:text-white' : 'shadow-md'\}/g, 'shadow-xl');

        code = code.replace(/\$\{frontendConfig\?.containerStyle === 'glass' \? 'bg-white\/70 backdrop-blur shadow-2xl border-white\/50' : frontendConfig\?.containerStyle === 'bordered' \? 'border-2 border-gray-200 shadow-none' : 'shadow-xl shadow-gray-200\/40 border border-gray-100'\}/g, 'shadow-xl shadow-gray-200/40 border border-gray-100');

        fs.writeFileSync(file, code);
    }
});
console.log("Patched startup-0003 pages.");
