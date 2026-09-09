const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', filePath);
}

// Fix content-type.controller.ts
replaceInFile('src/nrt/cms/content-type.controller.ts', [
    [/@UseGuards\(JwtAuthGuard, RolesGuard\)/g, '@UseGuards(JwtAuthGuard, RolesGuard)'],
    [/import \{ Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query \} from '@nestjs\/common';/, "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';\nimport { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';\nimport { RolesGuard } from '../../common/guards/roles.guard';\nimport { SiteId as CurrentUser } from '../../common/decorators/site-id.decorator';"],
    [/import \{ JwtAuthGuard \} from '..\/..\/auth\/guards\/jwt-auth.guard';\nimport \{ RolesGuard \} from '..\/..\/auth\/guards\/roles.guard';\nimport \{ Roles \} from '..\/..\/auth\/decorators\/roles.decorator';\nimport \{ CurrentUser \} from '..\/..\/auth\/decorators\/current-user.decorator';/g, "import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';\nimport { RolesGuard } from '../../common/guards/roles.guard';\nimport { Roles } from '../../common/decorators/roles.decorator';\nimport { SiteId as CurrentUser } from '../../common/decorators/site-id.decorator';"]
]);

// Fix page.controller.ts
replaceInFile('src/nrt/cms/page.controller.ts', [
    [/import \{ Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query \} from '@nestjs\/common';/, "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';\nimport { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';\nimport { RolesGuard } from '../../common/guards/roles.guard';\nimport { SiteId as CurrentUser } from '../../common/decorators/site-id.decorator';"],
    [/import \{ JwtAuthGuard \} from '..\/..\/auth\/guards\/jwt-auth.guard';\nimport \{ RolesGuard \} from '..\/..\/auth\/guards\/roles.guard';\nimport \{ Roles \} from '..\/..\/auth\/decorators\/roles.decorator';\nimport \{ CurrentUser \} from '..\/..\/auth\/decorators\/current-user.decorator';/g, "import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';\nimport { RolesGuard } from '../../common/guards/roles.guard';\nimport { Roles } from '../../common/decorators/roles.decorator';\nimport { SiteId as CurrentUser } from '../../common/decorators/site-id.decorator';"]
]);

// Fix coupon.controller.ts
replaceInFile('src/nrt/coupon/coupon.controller.ts', [
    [/import \{ Controller, Get, Post, Body, Patch, Param, Delete, UseGuards \} from '@nestjs\/common';/, "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';\nimport { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';\nimport { RolesGuard } from '../../common/guards/roles.guard';\nimport { Roles } from '../../common/decorators/roles.decorator';"],
    [/import \{ JwtAuthGuard \} from '..\/..\/auth\/guards\/jwt-auth.guard';\nimport \{ RolesGuard \} from '..\/..\/auth\/guards\/roles.guard';\nimport \{ Roles \} from '..\/..\/auth\/decorators\/roles.decorator';/g, "import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';\nimport { RolesGuard } from '../../common/guards/roles.guard';\nimport { Roles } from '../../common/decorators/roles.decorator';"]
]);

// Fix content-type.service.ts
replaceInFile('src/nrt/cms/content-type.service.ts', [
    [/tenantId \? \{ OR: \[\{ tenantId \}, \{ tenantId: null \}\] \} : \{\}/g, "tenantId ? {} : {}"],
    [/contentTypeId, tenantId, data: entryData/g, "contentTypeId, data: entryData"]
]);

// Fix coupon.service.ts
replaceInFile('src/nrt/coupon/coupon.service.ts', [
    [/expiryDate: new Date\(createCouponDto\.validTo\),/g, "validTo: new Date(createCouponDto.expiryDate),\n        validFrom: new Date(),\n        discountType: createCouponDto.type,\n        discountValue: createCouponDto.value,\n        maxUses: createCouponDto.usageLimit,\n        minBookingAmount: createCouponDto.minAmount"],
    [/\.\.\.createCouponDto,/g, "code: createCouponDto.code,"]
]);
