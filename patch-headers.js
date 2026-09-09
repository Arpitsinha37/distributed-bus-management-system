const fs = require('fs');
const path = require('path');
const apps = ['storefront', 'storefront-chitwan', 'storefront-lumbini'];

apps.forEach(app => {
    const file = path.join(__dirname, app, 'src', 'components', 'layout', 'Header.tsx');
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Let's just do simple string replacements to avoid regex escaping hell
        
        // For storefront: Replace the old Book link in desktop if it exists
        content = content.replace(
            '<Link href="/content/about" className="text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? \'text-slate-600 hover:text-[#D4831E]\' : \'text-white/80 hover:text-white\'}">Content</Link>',
            '<Link href="/content/about" className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? "text-slate-600 hover:text-[#E31837]" : "text-white/80 hover:text-white"}`}>Content</Link>'
        );
        
        // Remove the hardcoded Book link in mobile nav
        if (content.includes('>Book</Link>')) {
            content = content.replace(
                '<Link\n            href="/"\n            onClick={() => setMobileOpen(false)}\n            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"\n          >\n            Book\n          </Link>',
                '<Link\n            href="/content/about"\n            onClick={() => setMobileOpen(false)}\n            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"\n          >\n            Content\n          </Link>'
            );
        }
        
        // Add content link to desktop if missing
        if (!content.includes('href="/content/about"')) {
            content = content.replace('{/* Desktop Navigation */}', '{/* Desktop Navigation */}\n          <Link href="/content/about" className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? "text-slate-600 hover:text-[#E31837]" : "text-white/80 hover:text-white"}`}>Content</Link>');
        }
        
        fs.writeFileSync(file, content);
        console.log('Patched ' + file);
    }
});
