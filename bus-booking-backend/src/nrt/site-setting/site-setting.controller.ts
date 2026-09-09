import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SiteSettingService } from './site-setting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@ApiTags('Site Settings') @Controller('site-settings')
export class SiteSettingController {
    constructor(private readonly svc: SiteSettingService) { }
    @Get() get() { return this.svc.get(); }
    @Put() @UseGuards(JwtAuthGuard) @ApiBearerAuth() update(@Body() body: any) { return this.svc.update(body); }
}
