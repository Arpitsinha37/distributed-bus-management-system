const fs = require('fs');
const path = require('path');
const baseDir = 'd:/distributed bus management system/admin-panel/src/app/dashboard';
const backendRoutes = ['auth', 'bookings', 'cms', 'coupons', 'crew', 'fleet', 'payments', 'reporting', 'routes', 'schedules', 'sites', 'staff', 'trips'];
console.log('| Section | Called Path | Backend Exists? |');
console.log('|---|---|---|');
function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (f === 'page.tsx') {
            const content = fs.readFileSync(full, 'utf8');
            const regex = /api(?:Get|Post|Put|Patch|Delete|authFetch)(?:<[^>]+>)?\s*\(\s*['`"]([^'`"]+)['`"]/g;
            let m;
            while ((m = regex.exec(content))) {
                const p = m[1];
                const base = p.split('/')[1].replace(/\?.*|\$.*/, '');
                if (!backendRoutes.includes(base)) {
                    const section = full.replace(baseDir, '').replace(/\\/g, '/').replace('/page.tsx', '') || '/dashboard root';
                    console.log(`| ${section} | \`${p}\` | ❌ No (\`${base}\` missing) |`);
                }
            }
        }
    }
}
walk(baseDir);
