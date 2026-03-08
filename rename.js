const fs = require('fs');

const files = [
    'apps/platform-web/index.html',
    'apps/platform-web/src/pages/DashboardPage.tsx',
    'apps/platform-web/src/components/Sidebar.tsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/LaunchPad/g, 'StartupOptima');
    content = content.replace(/Launchpad/g, 'StartupOptima');
    content = content.replace(/launchpad/g, 'startupOptima');
    fs.writeFileSync(f, content);
    console.log('Rebranded:', f);
});
