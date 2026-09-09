const fs = require('fs');
const path = require('path');
const apps = ['storefront', 'storefront-chitwan', 'storefront-lumbini'];

apps.forEach(app => {
    const filePath = path.join(__dirname, app, 'src', 'components', 'layout', 'Header.tsx');
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hardcoded links with /content links
    content = content.replace(/href="\/about"/g, 'href="/content/about"');
    content = content.replace(/href="\/contact"/g, 'href="/content/contact"');
    
    fs.writeFileSync(filePath, content);
    console.log('Updated links in ' + app + '/Header.tsx');
});
