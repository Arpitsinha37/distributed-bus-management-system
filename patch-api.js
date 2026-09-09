const fs = require('fs');
const filePath = 'd:/distributed bus management system/storefront/src/lib/api.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('get: (path: string, options?: any)')) {
  const insertIndex = content.indexOf('export const api = {') + 20;
  const insertContent = `
    // Generic methods for React Query / raw Axios-like calls
    get: (path: string, options?: any) => {
        let q = '';
        if (options?.params) {
            q = '?' + new URLSearchParams(options.params).toString();
        }
        return fetchJSON(\`\${path}\${q}\`);
    },
    post: (path: string, data?: any) => postJSON(path, data || {}),
`;
  content = content.slice(0, insertIndex) + insertContent + content.slice(insertIndex);
  fs.writeFileSync(filePath, content);
  console.log('Added .get and .post to api.ts');
}
