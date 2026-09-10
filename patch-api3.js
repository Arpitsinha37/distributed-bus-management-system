const fs = require('fs');

const files = [
    'd:/distributed bus management system/storefront/src/lib/api.ts',
    'd:/distributed bus management system/storefront-chitwan/src/lib/api.ts',
    'd:/distributed bus management system/storefront-lumbini/src/lib/api.ts'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Fallback to Railway in production if NEXT_PUBLIC_API_URL is missing
    const newApiBase = `const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://backend-api-production-be2e.up.railway.app/api/v1' : 'http://localhost:3001/api/v1');`;
    
    content = content.replace(/const API_BASE = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001\/api';/, newApiBase);
    
    fs.writeFileSync(f, content);
});
console.log('Fixed API_BASE fallback in all storefronts');
