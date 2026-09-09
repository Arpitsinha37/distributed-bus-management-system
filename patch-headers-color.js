const fs = require('fs');
const path = require('path');
const apps = ['storefront', 'storefront-chitwan', 'storefront-lumbini'];

apps.forEach(app => {
    const filePath = path.join(__dirname, app, 'src', 'components', 'layout', 'Header.tsx');
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it already has usePathname
    if (!content.includes('usePathname')) {
        content = content.replace('import { useState, useEffect } from \'react\';', 'import { useState, useEffect } from \'react\';\nimport { usePathname } from \'next/navigation\';');
        
        // Add pathname and isDark logic
        content = content.replace(
            'const [mobileOpen, setMobileOpen] = useState(false);',
            'const [mobileOpen, setMobileOpen] = useState(false);\n  const pathname = usePathname();\n  const isHome = pathname === \'/\';\n  const isDark = scrolled || !isHome;'
        );
        
        // Replace all instances of `scrolled ?` with `isDark ?` for styling
        content = content.replace(/scrolled \?/g, 'isDark ?');
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${app}/Header.tsx`);
    } else {
        console.log(`Already updated ${app}/Header.tsx`);
    }
});
