const fs = require('fs');
const path = require('path');

const baseDir = 'd:/distributed bus management system/admin-panel/src/app/dashboard';
const backendRoutes = ['auth', 'bookings', 'cms', 'coupons', 'crew', 'fleet', 'payments', 'reporting', 'routes', 'schedules', 'sites', 'staff', 'trips'];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (f === 'page.tsx') {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /api(?:Get|Post|Put|Patch|Delete|authFetch)(?:<[^>]+>)?\s*\(\s*['"`]([^'"`]+)['"`]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const apiPath = match[1];
                let baseRoute = apiPath.split('/')[1] || '';
                // Handle cases like '/auth/login', baseRoute is 'auth'
                // Ensure no query string is included in the baseRoute check
                baseRoute = baseRoute.split('?')[0];
                
                const exists = backendRoutes.includes(baseRoute);
                const section = fullPath.replace(baseDir, '').replace(/\\/g, '/');
                
                console.log(`${section} | ${apiPath} | ${exists ? 'Y' : 'N'} | ${exists ? 'Wired' : 'Phantom'}`);
            }
        }
    }
}

console.log("Section | Called Path | Real Backend Route Exists? (Y/N) | Verdict");
console.log("-------------------------------------------------------------------");
walk(baseDir);
