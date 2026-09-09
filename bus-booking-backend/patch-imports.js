const fs = require('fs');
const imports = `
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SiteId as CurrentUser } from '../../common/decorators/site-id.decorator';
`;

const files = [
    'src/nrt/cms/content-type.controller.ts',
    'src/nrt/cms/page.controller.ts',
    'src/nrt/coupon/coupon.controller.ts',
    'src/nrt/audit/audit.controller.ts',
    'src/nrt/blog/blog.controller.ts'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('JwtAuthGuard } from')) {
        content = content.replace('// @ts-nocheck', '// @ts-nocheck\n' + imports);
        fs.writeFileSync(f, content);
        console.log('Added imports to ' + f);
    }
});
