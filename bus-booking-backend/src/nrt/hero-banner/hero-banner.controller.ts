import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HeroBannerService } from './hero-banner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Hero Banners')
@Controller('hero-banners')
export class HeroBannerController {
    constructor(private readonly heroBannerService: HeroBannerService) { }

    @Get()
    findAll(@Query('active') active?: string) {
        return this.heroBannerService.findAll(active !== 'false');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.heroBannerService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    create(@Body() body: any) {
        return this.heroBannerService.create(body);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() body: any) {
        return this.heroBannerService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.heroBannerService.remove(id);
    }

    @Post(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    removePost(@Param('id') id: string) {
        return this.heroBannerService.remove(id);
    }

    @Patch(':id/active')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    toggleActive(@Param('id') id: string, @Body('active') active: boolean) {
        return this.heroBannerService.toggleActive(id, active);
    }
}
