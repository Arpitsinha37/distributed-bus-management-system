const fs = require('fs');
const filePath = 'd:/distributed bus management system/storefront/src/lib/api.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the get and post we just added
content = content.replace(
    /get: \(path: string, options\?: any\) => \{[\s\S]*?\},/m,
    `get: async (path: string, options?: any) => {
        let q = '';
        if (options?.params) {
            q = '?' + new URLSearchParams(options.params).toString();
        }
        const data = await fetchJSON(\`\${path}\${q}\`);
        return { data };
    },`
);

content = content.replace(
    /post: \(path: string, data\?: any\) => postJSON\(path, data \|\| \{\}\),/m,
    'post: async (path: string, payload?: any) => { const data = await postJSON(path, payload || {}); return { data }; },'
);

fs.writeFileSync(filePath, content);
console.log('Fixed api.get and api.post to return { data }');
