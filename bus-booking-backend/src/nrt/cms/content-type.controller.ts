// @ts-nocheck
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentTypeService } from './content-type.service';



@ApiTags('CMS - Content Types')
@Controller('cms')
export class ContentTypeController {
    constructor(private service: ContentTypeService) { }

    // ── Content Types ──
    @Get('types')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List content types' })
    findAllTypes(@CurrentUser('tenantId') tenantId: string) { return this.service.findAll(tenantId); }

    @Get('types/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    findType(@Param('id') id: string) { return this.service.findById(id); }

    @Post('types')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Create content type' })
    createType(@Body() dto: any) { return this.service.create(dto); }

    @Put('types/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    updateType(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

    @Delete('types/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    deleteType(@Param('id') id: string) { return this.service.delete(id); }

    // ── Content Entries ──
    @Get('entries/:contentTypeId')
    @ApiOperation({ summary: 'List entries for a content type (public)' })
    findEntries(@Param('contentTypeId') ctId: string, @Query('status') status?: string, @Query('page') page?: string) {
        return this.service.findEntries(ctId, undefined, status, Number(page) || 1);
    }

    @Get('entry/:id')
    @ApiOperation({ summary: 'Get entry by ID (public)' })
    findEntry(@Param('id') id: string) { return this.service.findEntry(id); }

    @Post('entries/:contentTypeId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Create content entry' })
    createEntry(@Param('contentTypeId') ctId: string, @CurrentUser('tenantId') tenantId: string, @Body() dto: any) {
        return this.service.createEntry(ctId, tenantId, dto.data, dto.slug);
    }

    @Put('entry/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    @ApiOperation({ summary: 'Update content entry (auto-saves version)' })
    updateEntry(@Param('id') id: string, @Body() dto: any) {
        return this.service.updateEntry(id, dto.data, dto.status);
    }

    @Delete('entry/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    
    deleteEntry(@Param('id') id: string) { return this.service.deleteEntry(id); }
}

