import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PageService } from './page.service';



@ApiTags('CMS - Pages')
@Controller('pages')
export class PageController {
    constructor(private pageService: PageService) { }

    @Get('by-slug/:slug')
    @ApiOperation({ summary: 'Get page by slug (public)' })
    findBySlug(@Param('slug') slug: string, @Query('tenantId') tenantId?: string) {
        return this.pageService.findBySlug(slug, tenantId);
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List all pages' })
    findAll(@CurrentUser('tenantId') tenantId: string, @Query('status') status?: string) {
        return this.pageService.findAll(tenantId, status);
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    findById(@Param('id') id: string) { return this.pageService.findById(id); }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Create page' })
    create(@CurrentUser('tenantId') tenantId: string, @Body() dto: any) {
        return this.pageService.create({ ...dto, tenantId });
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    update(@Param('id') id: string, @Body() dto: any) { return this.pageService.update(id, dto); }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    delete(@Param('id') id: string) { return this.pageService.delete(id); }
}

