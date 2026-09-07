const fs = require('fs');
const pages = ['blogs', 'faqs', 'gallery', 'sliders', 'team', 'testimonials'];
pages.forEach(p => {
    const file = 'd:/distributed bus management system/admin-panel/src/app/dashboard/content/' + p + '/page.tsx';
    let code = fs.readFileSync(file, 'utf8');
    
    if (code.includes('ErrorBanner')) return;

    // Add import
    code = code.replace(/import { Plus, Pencil/, "import ErrorBanner from '@/components/ErrorBanner';\nimport { Plus, Pencil");
    if (!code.includes('import ErrorBanner')) {
        code = code.replace(/import { Plus, /, "import ErrorBanner from '@/components/ErrorBanner';\nimport { Plus, ");
    }
    if (!code.includes('import ErrorBanner')) {
        code = code.replace(/import { Plus }/, "import ErrorBanner from '@/components/ErrorBanner';\nimport { Plus }");
    }

    // Add error state
    code = code.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n    const [error, setError] = useState<string | null>(null);");

    // Add try-catch properly
    code = code.replace(/try { const res = await apiGet<([^>]+)>([^;]+); setData\(res \|\| \[\]\); } catch {} setLoading\(false\);/, 
    "try { setError(null); const res = await apiGet<$1>$2; setData(res || []); } catch (err: any) { setError(err.message || 'Failed to load'); } setLoading(false);");

    // Add ErrorBanner to JSX
    code = code.replace(/<div className="flex items-center justify-between mb-6">/, "<ErrorBanner message={error} />\n            <div className=\"flex items-center justify-between mb-6\">");

    fs.writeFileSync(file, code);
});

// Now do site-settings
const setFile = 'd:/distributed bus management system/admin-panel/src/app/dashboard/content/site-settings/page.tsx';
let setCode = fs.readFileSync(setFile, 'utf8');
if (!setCode.includes('ErrorBanner')) {
    setCode = setCode.replace(/import { Settings, Save }/, "import ErrorBanner from '@/components/ErrorBanner';\nimport { Settings, Save }");
    setCode = setCode.replace(/const \[loading, setLoading\] = useState\(true\);/, "const [loading, setLoading] = useState(true);\n    const [error, setError] = useState<string | null>(null);");
    setCode = setCode.replace(/try {\r?\n\s*const res = await apiGet<SiteSetting>\('\/cms\/settings', accessToken!\);/, "try {\n            setError(null);\n            const res = await apiGet<SiteSetting>('/cms/settings', accessToken!);");
    setCode = setCode.replace(/} catch {}\r?\n\s*setLoading\(false\);/, "} catch (err: any) { setError(err.message || 'Failed to load settings'); }\n        setLoading(false);");
    setCode = setCode.replace(/<div className="flex items-center justify-between mb-6">/, "<ErrorBanner message={error} />\n            <div className=\"flex items-center justify-between mb-6\">");
    fs.writeFileSync(setFile, setCode);
}
console.log('Done patching.');
